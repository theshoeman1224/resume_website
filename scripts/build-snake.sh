#!/usr/bin/env bash
set -euo pipefail

repository_root=$(git rev-parse --show-toplevel)
snake_repository="https://github.com/theshoeman1224/snake.git"
snake_ref="24eb2eeec993689c80312c10816c72f8aeeeaf1b"
snake_source=${SNAKE_SOURCE_DIR:-}

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
