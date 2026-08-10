#!/usr/bin/env bash
set -euo pipefail

repository_root=$(git rev-parse --show-toplevel)
snake_repository="https://github.com/theshoeman1224/snake.git"
metadata_manifest="$repository_root/.portfolio-cache/repositories.json"
snake_ref=${SNAKE_REF:-}
snake_source=${SNAKE_SOURCE_DIR:-}

if [[ -z "$snake_ref" ]]; then
  if [[ ! -f "$metadata_manifest" ]]; then
    printf 'Portfolio metadata is missing. Run npm run sync:portfolio first.\n' >&2
    exit 1
  fi
  snake_ref=$(node -e 'const fs = require("node:fs"); const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(data.repositories["theshoeman1224/snake"].revision);' "$metadata_manifest")
fi

if [[ -z "$snake_source" ]]; then
  temporary_root=$(mktemp -d)
  snake_source="$temporary_root/snake"
  git clone --quiet "$snake_repository" "$snake_source"
  git -C "$snake_source" checkout --quiet "$snake_ref"
fi

source_commit=$(git -C "$snake_source" rev-parse HEAD)
if [[ "$source_commit" != "$snake_ref" ]]; then
  printf 'Snake source must be checked out at %s; found %s\n' "$snake_ref" "$source_commit" >&2
  exit 1
fi

(
  cd "$snake_source"
  ./scripts/export-to-resume.sh "$repository_root/public/games/snake"
)
