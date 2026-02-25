#!/usr/bin/env bash
set -euo pipefail

# Start a mux API server suitable for use with mux-orchestrator-spec.sh.
#
# This script:
#   - Starts `mux server` on a configurable host/port (defaults: 127.0.0.1:3000).
#   - Prints the auth token and export commands for convenience.
#   - Optionally adds a project to mux via --add-project.
#
# Usage:
#   ./scripts/mux-start-server.sh
#   PROJECT_DIR=/path/to/repo ./scripts/mux-start-server.sh
#   HOST=0.0.0.0 PORT=4000 ./scripts/mux-start-server.sh

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3000}"
PROJECT_DIR="${PROJECT_DIR:-}"

if ! command -v mux >/dev/null 2>&1; then
  echo "mux CLI not found on PATH. Install/build mux first." >&2
  exit 1
fi

ARGS=(server --host "$HOST" --port "$PORT" --print-auth-token)

if [ -n "${PROJECT_DIR}" ]; then
  if [ ! -d "$PROJECT_DIR" ]; then
    echo "PROJECT_DIR does not exist: $PROJECT_DIR" >&2
    exit 1
  fi
  ARGS+=(--add-project "$PROJECT_DIR")
fi

echo "Starting mux server on ${HOST}:${PORT}..."
echo "Command: mux ${ARGS[*]}"
echo

# mux server is long-running; let it own the terminal so you can see logs.
mux "${ARGS[@]}"

