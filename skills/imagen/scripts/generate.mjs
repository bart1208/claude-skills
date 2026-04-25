#!/usr/bin/env node
/**
 * Image generator via Vercel AI Gateway.
 * No external dependencies — only built-in Node.js modules.
 *
 * Two endpoint modes (auto-detected from model name):
 *   - Gemini image models      → POST /v1/chat/completions  (modalities: text+image)
 *   - Imagen / DALL-E / FLUX   → POST /v1/images/generations (OpenAI-compatible)
 *
 * Loads AI_GATEWAY_API_KEY from env or .env.local in the current working dir.
 */

import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'

// --- Parse arguments ---
const args = process.argv.slice(2)
function getArg(name) {
  const i = args.indexOf(`--${name}`)
  return i !== -1 ? args[i + 1] : null
}

const prompt = getArg('prompt')
const output = getArg('output')
const model = getArg('model') || 'google/gemini-2.5-flash-image-preview'
const size = getArg('size') || '1024x1024'      // images endpoint only
const aspectRatio = getArg('aspect') || '1:1'   // imagen-style models

if (!prompt || !output) {
  console.error('Usage: generate.mjs --prompt "..." --output "path/to/out.png"')
  console.error('  [--model "google/gemini-2.5-flash-image-preview"]')
  console.error('     other choices: bfl/flux-2-flex, openai/dall-e-3,')
  console.error('                    google/imagen-4.0-ultra-generate-001')
  console.error('  [--size "1024x1024"]   (DALL-E / Imagen)')
  console.error('  [--aspect "1:1" | "16:9" | "9:16"]   (Imagen)')
  process.exit(1)
}

// --- Load API key ---
let apiKey = process.env.AI_GATEWAY_API_KEY
if (!apiKey) {
  for (const envFile of ['.env.local', '.env']) {
    try {
      const content = fs.readFileSync(path.join(process.cwd(), envFile), 'utf8')
      const match = content.match(/^AI_GATEWAY_API_KEY=(.+)$/m)
      if (match) { apiKey = match[1].trim(); break }
    } catch { /* file doesn't exist */ }
  }
}

if (!apiKey) {
  console.error('Error: AI_GATEWAY_API_KEY not found in environment or .env.local')
  console.error('Get one at https://vercel.com/dashboard → AI Gateway → API Keys')
  process.exit(1)
}

// --- Decide endpoint shape from model name ---
const useChatCompletions = model.includes('gemini')

const requestPath = useChatCompletions ? '/v1/chat/completions' : '/v1/images/generations'

let body
if (useChatCompletions) {
  body = JSON.stringify({
    model,
    messages: [{ role: 'user', content: prompt }],
    modalities: ['text', 'image'],
    stream: false,
  })
} else {
  // OpenAI-compatible images endpoint
  const payload = {
    model,
    prompt,
    n: 1,
    size,
    response_format: 'b64_json',
  }
  if (model.includes('imagen')) {
    payload.providerOptions = { googleVertex: { aspectRatio } }
  }
  body = JSON.stringify(payload)
}

const options = {
  hostname: 'ai-gateway.vercel.sh',
  path: requestPath,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}

console.log(`Gateway: vercel`)
console.log(`Model:   ${model}`)
console.log(`Mode:    ${useChatCompletions ? 'chat-completions' : 'images-generations'}`)
console.log(`Prompt:  "${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}"`)
console.log('Generating...')

// --- Helper: turn a returned URL into a buffer ---
function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Fetch ${url} failed with ${res.statusCode}`))
        return
      }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// --- Helper: data URI → Buffer ---
function decodeDataUri(uri) {
  const match = uri.match(/^data:[^;]+;base64,(.+)$/)
  if (!match) throw new Error('Not a base64 data URI')
  return Buffer.from(match[1], 'base64')
}

// --- Make the request ---
const req = https.request(options, (res) => {
  const chunks = []
  res.on('data', (c) => chunks.push(c))
  res.on('end', async () => {
    const buf = Buffer.concat(chunks)

    if (res.statusCode !== 200) {
      console.error(`Error ${res.statusCode}: ${buf.toString().slice(0, 800)}`)
      process.exit(1)
    }

    let imageBuf
    try {
      const json = JSON.parse(buf.toString())

      if (useChatCompletions) {
        const imageUrl = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url
        if (!imageUrl) {
          console.error('No image in chat response:', JSON.stringify(json).slice(0, 800))
          process.exit(1)
        }
        imageBuf = imageUrl.startsWith('data:') ? decodeDataUri(imageUrl) : await fetchBinary(imageUrl)
      } else {
        const item = json?.data?.[0]
        if (item?.b64_json) {
          imageBuf = Buffer.from(item.b64_json, 'base64')
        } else if (item?.url) {
          imageBuf = await fetchBinary(item.url)
        } else {
          console.error('No image in response:', JSON.stringify(json).slice(0, 800))
          process.exit(1)
        }
      }
    } catch (err) {
      console.error('Failed to parse response:', err.message)
      console.error('Body:', buf.toString().slice(0, 800))
      process.exit(1)
    }

    const outputPath = path.resolve(process.cwd(), output)
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, imageBuf)

    console.log(`✓ Saved to: ${outputPath}`)
    console.log(`  Size: ${(imageBuf.length / 1024).toFixed(1)} KB`)
  })
})

req.on('error', (err) => {
  console.error('Request failed:', err.message)
  process.exit(1)
})

req.write(body)
req.end()
