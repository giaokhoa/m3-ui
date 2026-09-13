#!/usr/bin/env bash
set -euo pipefail

readonly container_workspace="/workspaces/m3-ui"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker CLI is required on the host to bridge Codex to the m3-ui devcontainer." >&2
  exit 127
fi

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd -P)"
repo_root="$(cd "${repo_root}" && pwd -P)"
readonly repo_root

container_id="$(
  docker ps     --filter "label=devcontainer.local_folder=${repo_root}"     --format '{{.ID}}'     | head -n 1
)"

if [ -z "${container_id}" ]; then
  echo "No running m3-ui devcontainer found for host workspace: ${repo_root}" >&2
  echo "Open/reopen this repository in its devcontainer, then retry." >&2
  exit 1
fi

if ! docker exec   -u vscode   -e HOME=/home/vscode   -w "${container_workspace}"   "${container_id}"   test -x /usr/local/bin/desktop-commander
then
  echo "Desktop Commander is not installed in the m3-ui devcontainer." >&2
  echo "Rebuild the devcontainer so .devcontainer/scripts/setup-dev-tools.sh runs." >&2
  exit 1
fi

exec docker exec   -i   -u vscode   -e HOME=/home/vscode   -w "${container_workspace}"   "${container_id}"   /usr/local/bin/desktop-commander   --no-onboarding
