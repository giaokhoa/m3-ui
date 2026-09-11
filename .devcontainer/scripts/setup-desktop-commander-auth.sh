#!/usr/bin/env bash
set -euo pipefail

readonly state_dir="${HOME}/.desktop-commander-device"
readonly device_file="${state_dir}/device.json"

install -d -m 700 "${state_dir}"

if ! command -v desktop-commander >/dev/null 2>&1; then
  echo "Desktop Commander is not installed. Re-run the devcontainer setup first." >&2
  exit 1
fi

if [ -s "${device_file}" ]; then
  echo "Desktop Commander already has a persisted m3-ui device credential."
  echo "Starting the remote agent with the existing session."
else
  cat <<'EOF'
Starting one-time Desktop Commander Remote OAuth device pairing for m3-ui.

Follow the verification URL/code printed below and approve it in your browser.
The credential is stored only in the dedicated m3-ui Docker volume.
EOF
fi

exec desktop-commander remote
