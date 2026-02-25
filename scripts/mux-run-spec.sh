#!/usr/bin/env bash
set -euo pipefail

# Run an autonomous mux agent against this repository based on a local spec file.
# Usage:
#   ./scripts/mux-run-spec.sh
#   PROJECT_DIR=/path/to/repo SPEC_PATH=/path/to/SPEC.md ./scripts/mux-run-spec.sh
#   PROMPT_FILE=/path/to/prompt.md ./scripts/mux-run-spec.sh

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
SPEC_PATH="${SPEC_PATH:-"$PROJECT_DIR/SPEC.md"}"
PROMPT_FILE="${PROMPT_FILE:-"$PROJECT_DIR/prompt.md"}"
MODEL="${MODEL:-openai:gpt-5.2-pro}"
THINKING="${THINKING:-high}"        # off|low|medium|high|xhigh|max or numeric
BUDGET="${BUDGET:-5.00}"            # Max USD spend for this run

if ! command -v mux >/dev/null 2>&1; then
  echo "mux CLI not found on PATH. Install/build mux first." >&2
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

echo "Running mux on project: $PROJECT_DIR"
echo "Using spec: $SPEC_PATH"
echo "Model: $MODEL | Thinking: $THINKING | Budget: \$$BUDGET"
echo

mux run \
  --dir "$PROJECT_DIR" \
  --mode plan \
  --model "$MODEL" \
  --thinking "$THINKING" \
  --budget "$BUDGET" \
  "$PROMPT"

