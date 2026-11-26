---
name: open-compute-mcp
version: "0.1.0-alpha.20"
type: product-skill
status: active
visibility: public
---

# open-compute-mcp — Product Skill for Agents & Humans

Use `open-compute-mcp` when an AI assistant or human developer needs a Node.js npm launcher that connects a local MCP client over `stdio` JSON-RPC to the separate Python [`open-compute`](https://github.com/ellmos-ai/open-compute) computer-use server.

## Scope & Honest Boundaries

- **Supported package version:** `0.1.0-alpha.20` (launcher manifest in this repository).
- **What this package does:** Resolves the backend launch command, applies a token-saving capture scaling default (`OC_CAPTURE_SCALE=0.5` unless overridden), spawns the Python `open-compute` MCP server, and forwards `stdin`/`stdout`/`stderr` over local `stdio`.
- **What this package does NOT do:** It does not implement an OS sandbox, firewall, network filter, environment scrubber, or privilege drop. The spawned Python child inherits the launcher's environment and OS permissions.
- **Desktop requirement:** Real screen capture (`capture`, `capture_filtered`) and Win32/UIA input (`do`, `click_name`, `invoke`) require an interactive Windows desktop session on the MCP client's host. No hosted or Glama cloud desktop execution is provided.

## Prerequisites

- **Node.js** `>= 18.0.0`
- **`uv` / `uvx`** on `PATH` (for default GitHub bootstrap) and **Python `>= 3.10`**
- **Network access** on first `uvx` launch (or npm install) unless using `OPEN_COMPUTE_PYTHON` or `OPEN_COMPUTE_MCP_CMD` with a preinstalled local Python environment
- **Interactive Windows desktop** for live screenshot capture and mouse/keyboard/UIA actions

## Installation & MCP Client Configuration

Configure your local MCP client (`claude_desktop_config.json`, Cursor, Antigravity, etc.):

```json
{
  "mcpServers": {
    "open-compute": {
      "command": "npx",
      "args": ["-y", "open-compute-mcp"]
    }
  }
}
```

## Launch Resolution Order (`bin/open-compute-mcp.js`)

The launcher checks environment overrides in strict priority order (first match wins):

| Priority | Environment Variable | Command Invoked | Typical Use |
|---|---|---|---|
| 1 | `OPEN_COMPUTE_MCP_CMD` | Whitespace-tokenized command string | Custom wrapper or flags |
| 2 | `OPEN_COMPUTE_PYTHON` | `<python> -m open_compute.mcp_server` | Preinstalled local venv/Python |
| 3 (default) | `OPEN_COMPUTE_EXTRAS`, `OPEN_COMPUTE_GIT_REF` | `uvx --from "open-compute[<extras>] @ git+https://github.com/ellmos-ai/open-compute.git@<ref>" open-compute-mcp` | Zero-setup GitHub launch (`extras` default `mcp,local,uia`, `ref` default `master`) |

## Token-Saving Capture Scaling (`applyCaptureDefaults`)

- When **both** `OC_CAPTURE_SCALE` and `OC_CAPTURE_MAX_DIM` are `undefined`, the launcher sets `OC_CAPTURE_SCALE="0.5"`.
- Because `open-compute` coordinates are normalized `0..1`, half-resolution frames reduce agent vision-token cost without losing click accuracy.
- Explicit values always win: set `OC_CAPTURE_SCALE="1.0"` for full resolution or `OC_CAPTURE_MAX_DIM="1024"` for a fixed dimension cap. An empty string (`""`) is treated as an intentional override and left untouched.

## Backend Tool Inventory (19 Tools in `open-compute`)

Tool schemas are served dynamically by the running Python backend (`tools/list`):

- **Observation & UIA:** `capture`, `observe_filtered`, `capture_filtered`, `tree`, `list_windows`, `get_screen_size`
- **Gated Desktop Actions:** `do`, `click_name`, `invoke`
- **Monitoring & Replay:** `watch_dir`, `push_status`, `rec_replay`
- **Signal Overlay & Safety Controls:** `signal_show`, `signal_hide`, `signal_status`, `signal_abort`
- **Voice & Companion Tools:** `chat`, `note_observation`, `talk`

## Exit Codes & Verification

- **Exit `0`:** Child process exited cleanly.
- **Exit `127`:** Launcher failed to spawn the configured backend command (`cmd` missing or not executable); diagnostic hint is written to `stderr`.
- **Signal forwarding:** `SIGINT`, `SIGTERM`, and `SIGHUP` are forwarded to the child process, and child termination signals are re-raised faithfully.
- **Offline verification (in a repository clone):**
  ```sh
  npm test
  node -e "const m = require('./bin/open-compute-mcp.js'); console.log(m.resolveLaunch({}));"
  npm pack --dry-run
  ```

## Related Files

- [English README](README.md) · [German README](README_de.md)
- [LLM Context Index](llms.txt) · [Compatibility Pointer](llm.txt)
- [Security Policy](SECURITY.md) · [Contributing Guide](CONTRIBUTING.md)
- [Detailed Archived Guide](docs/archive/README-2026-10-12.md)
