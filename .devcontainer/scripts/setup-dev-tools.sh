#!/usr/bin/env bash
set -euo pipefail

readonly desktop_commander_version='0.2.50'
readonly device_file='/home/vscode/.desktop-commander-device/device.json'

npm install --global "@wonderwhy-er/desktop-commander@${desktop_commander_version}"

sudo install -d -m 700 -o vscode -g vscode \
  /home/vscode/.config/gh \
  /home/vscode/.desktop-commander \
  /home/vscode/.desktop-commander-device
sudo chown -R vscode:vscode \
  /home/vscode/.config/gh \
  /home/vscode/.desktop-commander \
  /home/vscode/.desktop-commander-device

readonly workspace_root='/workspaces/m3-ui'
if ! git config --global --get-all safe.directory | grep -Fxq "${workspace_root}"; then
  git config --global --add safe.directory "${workspace_root}"
fi

if command -v gh >/dev/null 2>&1 && gh auth status --hostname github.com >/dev/null 2>&1; then
  gh auth setup-git --hostname github.com
fi

if [ ! -s "${device_file}" ]; then
  cat <<'EOF'

Desktop Commander Remote is installed but not paired for the m3-ui devcontainer.
Run once in an interactive terminal:
  bash .devcontainer/scripts/setup-desktop-commander-auth.sh

The OAuth device credential is stored in the dedicated
m3-ui-desktop-commander-device Docker volume.
EOF
fi
