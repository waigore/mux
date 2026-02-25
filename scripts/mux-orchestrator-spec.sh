#!/usr/bin/env bash
set -euo pipefail

# Run an orchestrator agent via the mux API against an existing workspace on a running mux server.
# This uses `mux api workspace send-message` with agentId=orchestrator, instead of `mux run`.
#
# Requirements:
#   - A mux API server is running (see scripts/mux-start-server.sh).
#   - A workspace already exists that is attached to your repo.
#   - You provide its ID via WORKSPACE_ID.
#
# Usage:
#   WORKSPACE_ID=<id> ./scripts/mux-orchestrator-spec.sh
#   WORKSPACE_ID=<id> SPEC_PATH=/path/to/SPEC.md ./scripts/mux-orchestrator-spec.sh
#   WORKSPACE_ID=<id> PROMPT_FILE=./scripts/stronger-agent.md ./scripts/mux-orchestrator-spec.sh

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
SPEC_PATH="${SPEC_PATH:-"$PROJECT_DIR/SPEC.md"}"
PROMPT_FILE="${PROMPT_FILE:-"$PROJECT_DIR/prompt.md"}"
WORKSPACE_ID="${WORKSPACE_ID:-}"
MODEL="${MODEL:-openai:gpt-5.2-pro}"
THINKING="${THINKING:-high}"        # off|low|medium|high|xhigh|max or numeric

if ! command -v mux >/dev/null 2>&1; then
  echo "mux CLI not found on PATH. Install/build mux first." >&2
  exit 1
fi

if [ -z "$WORKSPACE_ID" ]; then
  echo "WORKSPACE_ID is required (ID of an existing mux workspace)." >&2
  exit 1
fi

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Project dir does not exist: $PROJECT_DIR" >&2
  exit 1
fi

if [ ! -f "$SPEC_PATH" ]; then
  echo "Spec file not found: $SPEC_PATH" >&2
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Prompt template file not found: $PROMPT_FILE" >&2
  echo "Create it (e.g. $PROJECT_DIR/prompt.md) with SPEC_PATH_PLACEHOLDER where the spec path should be mentioned." >&2
  exit 1
fi

PROMPT_TEMPLATE="$(cat "$PROMPT_FILE")"
PROMPT="${PROMPT_TEMPLATE//SPEC_PATH_PLACEHOLDER/$SPEC_PATH}"

echo "Using workspace: $WORKSPACE_ID"
echo "Project dir (for your reference): $PROJECT_DIR"
echo "Spec path: $SPEC_PATH"
echo "Prompt file: $PROMPT_FILE"
echo "Model: $MODEL | Thinking: $THINKING"
echo

# Note: trpc-cli maps nested object fields using dot notation, e.g. --options.model.
# The options.* flags below correspond to SendMessageOptionsSchema fields.
mux api workspace send-message \
  --workspace-id "$WORKSPACE_ID" \
  --message "$PROMPT" \
  --options.model "$MODEL" \
  --options.thinking-level "$THINKING" \
  --options.agent-id orchestrator

