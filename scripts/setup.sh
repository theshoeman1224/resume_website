#!/usr/bin/env bash

set -euo pipefail

readonly SKILLS_CLI_VERSION="1.5.22"
readonly ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

force=false

usage() {
  cat <<'EOF'
Usage: ./scripts/setup.sh [--force]

Install the locked npm dependencies and project skills.

Options:
  -f, --force  Install without asking for confirmation.
  -h, --help   Show this help message.
EOF
}

while (($# > 0)); do
  case "$1" in
    -f|--force)
      force=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

if [[ "$force" == false ]]; then
  printf 'Install locked npm dependencies and project skills? [y/N] '
  if ! read -r reply; then
    printf '\nSetup cancelled. Use --force for non-interactive installation.\n'
    exit 1
  fi

  case "$reply" in
    y|Y|yes|YES|Yes)
      ;;
    *)
      printf 'Setup cancelled.\n'
      exit 0
      ;;
  esac
fi

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 20) ? 0 : 1)'; then
  printf 'Node.js 22.20.0 or newer is required. Run `nvm use` and retry.\n' >&2
  exit 1
fi

cd "$ROOT_DIR"

printf 'Installing npm dependencies from package-lock.json...\n'
npm ci --ignore-scripts

install_skill() {
  local source="$1"
  local name="$2"

  printf 'Installing skill %s...\n' "$name"
  DISABLE_TELEMETRY=1 npx --yes "skills@${SKILLS_CLI_VERSION}" add "$source" \
    --skill "$name" \
    --agent opencode \
    --copy \
    --yes
}

install_skill \
  "https://github.com/mattpocock/skills/tree/068b6e0c62393147daf03530149cdce209c93da8/skills/engineering/codebase-design" \
  "codebase-design"
install_skill \
  "https://github.com/emilkowalski/skills/tree/86cf9f7d91c6de0215cbb2e36fccfe6c8127a841/skills/emil-design-eng" \
  "emil-design-eng"
install_skill \
  "https://github.com/anthropics/skills/tree/2235be7c60b551f5de82ade908fd3816455afcda/skills/frontend-design" \
  "frontend-design"
install_skill \
  "https://github.com/pbakaus/impeccable/tree/9ce0350054b0199bfd0ebbde95d9fd70c7c91741/.agents/skills/impeccable" \
  "impeccable"
install_skill \
  "https://github.com/vercel-labs/agent-skills/tree/ba46938889d4e58635362fb8f618e1178ac3ec46/skills/web-design-guidelines" \
  "web-design-guidelines"

printf 'Setup complete. Restart OpenCode to load newly installed skills.\n'
