#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"
TARGET_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

mkdir -p "$TARGET_DIR"

for skill_path in "$SKILLS_DIR"/*/; do
  skill_name="$(basename "$skill_path")"
  dest="$TARGET_DIR/$skill_name"

  if [ -d "$dest" ]; then
    echo "  updating $skill_name"
    rm -rf "$dest"
  else
    echo "  installing $skill_name"
  fi

  cp -r "$skill_path" "$dest"
done

echo "Done. $(ls "$SKILLS_DIR" | wc -l) skills installed to $TARGET_DIR"
