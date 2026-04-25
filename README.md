# claude-skills

Personal Claude Code skills for use across machines.

## Skills

| Skill | Description |
|---|---|
| `imagen` | Generate images via Vercel AI Gateway (Gemini, FLUX, DALL-E) |
| `playwright-cli` | Automate browser interactions and Playwright tests |
| `find-skills` | Discover and install Claude Code skills |
| `hf-cli` | Hugging Face Hub CLI — models, datasets, spaces, jobs |
| `phaser-gamedev` | Build 2D games with Phaser 3 |
| `sound-effects` | Generate sound effects with ElevenLabs |
| `text-to-speech` | Convert text to speech with ElevenLabs |

## Install

```bash
git clone git@github.com:bart1208/claude-skills.git
cd claude-skills
chmod +x install.sh
./install.sh
```

This copies all skills into `~/.claude/skills/`. Claude Code picks them up automatically.

## Update

```bash
git pull && ./install.sh
```

## Adding a skill to a project

To make a skill available only within a project, symlink it from your project's `.claude/skills/`:

```bash
mkdir -p /path/to/project/.claude/skills
ln -s ~/.claude/skills/phaser-gamedev /path/to/project/.claude/skills/phaser-gamedev
```
