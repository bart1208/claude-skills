# Claude Code Skills Setup

This repository contains personal Claude Code skills. When you open this directory, your job is to install all skills so they are available in every Claude Code session on this machine.

## What skills are included

| Skill | What it does |
|---|---|
| `imagen` | Generate images via Vercel AI Gateway (Gemini 2.5 Flash Image, FLUX, DALL-E) |
| `playwright-cli` | Automate browser interactions, run Playwright tests |
| `find-skills` | Discover and install Claude Code skills from the marketplace |
| `hf-cli` | Hugging Face Hub CLI — models, datasets, spaces, inference jobs |
| `phaser-gamedev` | Build 2D games with Phaser 3 (physics, tilemaps, animations) |
| `sound-effects` | Generate sound effects with ElevenLabs |
| `text-to-speech` | Convert text to speech with ElevenLabs (70+ languages) |

## How to install

Run the install script — it copies every skill under `skills/` into `~/.claude/skills/`:

```bash
chmod +x install.sh
./install.sh
```

Verify by listing the installed skills:

```bash
ls ~/.claude/skills/
```

You should see all 7 skill directories. Claude Code will pick them up automatically in the next session.

## How to update

When new skills are added to this repo, pull and re-run the installer:

```bash
git pull
./install.sh
```

## Required API keys

Some skills need environment variables set in your shell profile (`~/.bashrc` or `~/.zshrc`):

| Skill | Variable | Where to get it |
|---|---|---|
| `imagen` | `AI_GATEWAY_TOKEN` | Vercel AI Gateway dashboard |
| `sound-effects` | `ELEVENLABS_API_KEY` | ElevenLabs account settings |
| `text-to-speech` | `ELEVENLABS_API_KEY` | ElevenLabs account settings |
| `hf-cli` | `HF_TOKEN` | Hugging Face account → Access Tokens |

Skills without a corresponding key will still load but will fail when invoked — set the keys before using those skills.

## Adding a skill to a specific project only

If you want a skill available only inside one project (not globally), create a symlink from the project's `.claude/skills/` directory:

```bash
mkdir -p /path/to/project/.claude/skills
ln -s ~/.claude/skills/phaser-gamedev /path/to/project/.claude/skills/phaser-gamedev
```

## Troubleshooting

- **Skill not appearing in session** — restart Claude Code after running `install.sh`; skills are loaded at session start.
- **`install.sh` permission denied** — run `chmod +x install.sh` first.
- **API call fails inside a skill** — check that the required environment variable is exported and visible to the shell that launched Claude Code.
