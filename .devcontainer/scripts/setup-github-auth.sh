#!/usr/bin/env bash
set -euo pipefail

export GH_CONFIG_DIR="${GH_CONFIG_DIR:-/home/vscode/.config/gh}"
install -d -m 700 "$GH_CONFIG_DIR"

if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  gh auth login \
    --hostname github.com \
    --web \
    --git-protocol https \
    --insecure-storage
fi

gh auth setup-git --hostname github.com
if [ -f "$GH_CONFIG_DIR/hosts.yml" ]; then
  chmod 600 "$GH_CONFIG_DIR/hosts.yml"
fi
