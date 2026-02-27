## `mux-orchestrator-spec.sh` usage

This script runs the **orchestrator** agent against an existing mux workspace on a running mux server. It is a thin wrapper around:

- `mux api workspace send-message --options.agent-id orchestrator`

Use it when you want the orchestrator to implement a spec in this repo (and optionally open a PR) instead of using `mux run`.

---

### Prerequisites

- **Mux server is running** (desktop app, `mux server`, or `scripts/mux-start-server.sh`, including via systemd user service).
- **Workspace exists for this repo** and is attached to the correct git checkout (for example, branch `dev`).
- You know the **workspace ID** for that workspace.
- A **spec file** exists (default `./SPEC.md` in this repo).
- A **prompt template** exists (default `./prompt.md`) and contains the literal `SPEC_PATH_PLACEHOLDER`, which will be replaced with the spec path.
- GitHub credentials are available (for example via project secrets or env vars) if you want the orchestrator to open a PR.

---

### Getting the workspace ID

From this repo (or anywhere with access to mux):

```bash
mux api workspace list
```

Find the entry whose `project.projectPath` matches this repo and copy its `id` as `WORKSPACE_ID`.

---

### Example: implement a spec and open a PR against `dev`

1. **Create or update `SPEC.md`** at the repo root with your feature requirements.
2. **Create `prompt.md`** at the repo root (if it doesn’t exist), for example:

```markdown
You are the mux orchestrator agent operating on this repository.

Your task:
1. Read and fully understand the spec at: SPEC_PATH_PLACEHOLDER
2. Implement the spec in this repo.
3. Work on a feature branch based on the `dev` branch.
4. Run the appropriate lint and test commands for this repo.
5. Open a GitHub pull request targeting the `dev` branch with:
   - A clear title and summary
   - A bullet list of key changes
   - A short test plan (what you ran and results)

If anything is ambiguous, make a reasonable choice and document it in the PR description.
```

3. **Run the orchestrator script from the repo root**:

```bash
WORKSPACE_ID=<your-workspace-id> \
SPEC_PATH="$(pwd)/SPEC.md" \
PROMPT_FILE="$(pwd)/prompt.md" \
MODEL="openai:gpt-5.2-pro" \
THINKING="high" \
./scripts/mux-orchestrator-spec.sh
```

The script will:

- Build the final message by substituting `SPEC_PATH_PLACEHOLDER` with `SPEC_PATH`.
- Call `mux api workspace send-message` for the given `WORKSPACE_ID`.
- Ask the orchestrator to implement the spec and, if instructed, create a PR against `dev`.

You can monitor progress from:

- The mux workspace UI (streaming logs and tool calls).
- Your Git hosting provider (for the created PR and branch).

