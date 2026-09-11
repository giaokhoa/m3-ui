#!/usr/bin/env bash
set -euo pipefail

readonly state_dir="${HOME}/.desktop-commander-device"
readonly device_file="${state_dir}/device.json"
readonly pid_file="${state_dir}/remote.pid"
readonly log_file="${state_dir}/remote.log"

install -d -m 700 "${state_dir}"

if ! command -v desktop-commander >/dev/null 2>&1; then
  echo "Desktop Commander is not installed; skipping remote agent startup." >&2
  exit 0
fi

if [ ! -s "${device_file}" ]; then
  echo "Desktop Commander Remote is not paired for m3-ui yet."
  echo "Run: bash .devcontainer/scripts/setup-desktop-commander-auth.sh"
  exit 0
fi

if [ -s "${pid_file}" ]; then
  pid="$(cat "${pid_file}" 2>/dev/null || true)"
  if [[ "${pid}" =~ ^[0-9]+$ ]] && kill -0 "${pid}" 2>/dev/null; then
    echo "Desktop Commander remote agent already running (pid ${pid})."
    exit 0
  fi
  rm -f "${pid_file}"
fi

nohup desktop-commander remote </dev/null >>"${log_file}" 2>&1 &
pid=$!
printf '%s\n' "${pid}" >"${pid_file}"
chmod 600 "${pid_file}"

echo "Desktop Commander remote agent started (pid ${pid}); log: ${log_file}"
