---
name: imagen
description: Generate images via Vercel AI Gateway (Gemini 2.5 Flash Image, FLUX, DALL-E, Google Imagen) and save them as PNG files. Use this skill whenever the user wants to generate, create, or produce an image asset — for game backgrounds, character sprites, UI icons, scene art, or any visual content. Triggers on prompts like "generate an image of...", "create a background for...", "make a sprite of...", "produce art for...", or when assets need to be created for a game or application. Also use when the user says things like "draw me", "render a", "visualize", or "I need a picture of". Don't wait for the user to say "use this" — if they want an image made, use this skill.
---

# Image Generator (Vercel AI Gateway)

Generates images by calling the Vercel AI Gateway and saves them as PNG files.

## Prerequisites

- `AI_GATEWAY_API_KEY` set in the environment or in `.env.local` in the working directory
  - Get one at https://vercel.com/dashboard → AI Gateway → API Keys
- Node.js 18+ (uses built-in `https` — no npm install needed)

## How to use this skill

### Step 1: Confirm the API key

Check for `AI_GATEWAY_API_KEY` in this order:
1. `process.env.AI_GATEWAY_API_KEY`
2. `.env.local` in the current working directory
3. `.env` in the current working directory

If missing, tell the user: "Add `AI_GATEWAY_API_KEY=...` to your `.env.local`. Get a key at https://vercel.com/dashboard → AI Gateway → API Keys."

### Step 2: Run the generation script

```bash
node /home/bpasquale/.claude/skills/imagen/scripts/generate.mjs \
  --prompt "your image prompt here" \
  --output "path/to/output.png"
```

**Arguments:**
- `--prompt` (required) — description of the image
- `--output` (required) — where to save the PNG (relative or absolute path)
- `--model` (optional) — defaults to `google/gemini-2.5-flash-image-preview`
- `--size` (optional, images endpoint) — e.g. `1024x1024`
- `--aspect` (optional, Imagen) — e.g. `1:1`, `16:9`, `9:16`

The script auto-detects whether to use `/v1/chat/completions` (Gemini image models) or `/v1/images/generations` (Imagen/DALL-E/FLUX) based on the model name.

### Step 3: Verify and report

After the script runs:
- Confirm the file was created at the output path
- Tell the user what was generated and where
- For game assets, mention the next step (e.g., "Load it in Phaser with `this.load.image('bg_hub', '/assets/scenes/hub.png')`")

## Choosing a model

| Model | Approx. cost | Best for |
|---|---|---|
| `google/gemini-2.5-flash-image-preview` (default) | ~$0.01 | Cheap, fast, warm illustrative style — good for kids' game assets |
| `bfl/flux-2-flex` | ~$0.01–0.02 | Sharper photorealism, complex scenes |
| `openai/dall-e-3` | ~$0.04 | Stylized character art, classic DALL-E look |
| `google/imagen-4.0-ultra-generate-001` | ~$0.04 | Highest fidelity hero shots |

## Writing good prompts for game assets

For the "A Long Journey" space academy game, use this style guide:

- **Style**: Cartoon/illustrated, vibrant colors, child-friendly (ages 4–7), Pixar-adjacent, soft rounded shapes
- **Backgrounds**: Wide establishing shots, rich detail, no text
- **Characters**: Friendly robots and aliens, expressive faces, clean silhouettes — request "isolated on transparent or plain white background" for sprites
- **Mood**: Adventurous, warm, wonder-inspiring — never scary

**Example prompts:**
- Background: `"A colorful cartoon space academy hub with floating holographic displays, stars through large windows, warm orange and blue lighting, child-friendly Pixar-style illustration"`
- Character: `"A friendly cartoon robot professor with glowing blue visor, space academy uniform, expressive eyes, plain white background for sprite use, digital illustration"`
- Planet: `"A cartoon ice planet surface with soft pastel snow, glowing blue crystals, cozy alien village in background, bright and inviting, children's book illustration"`

## Output location for game assets

For the A Long Journey game, save assets to:
- Backgrounds: `public/assets/scenes/<name>.png`
- Characters: `public/assets/characters/<name>.png`
- Icons / badges: `public/assets/ui/<name>.png`
- Audio: use the ElevenLabs `sound-effects` and `text-to-speech` skills instead

## Error handling

- **401 / 403**: API key invalid or missing — re-check `AI_GATEWAY_API_KEY`
- **402**: Out of credits — top up at https://vercel.com/dashboard → AI Gateway → Billing
- **429**: Rate-limited — back off a few seconds and retry
- **400**: Prompt may violate safety filters — rephrase to be more neutral
- **Other**: Show the full error body so the user can decide
