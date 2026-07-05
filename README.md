<p align="center">
  <img src="https://raw.githubusercontent.com/ellmos-ai/open-compute-mcp/main/assets/banner.png" alt="open-compute-mcp banner" width="100%">
</p>

# open-compute-mcp

**npm launcher for the [open-compute](https://github.com/ellmos-ai/open-compute) MCP server** —
model-agnostic **computer-use** tools exposed over the Model Context Protocol (MCP).

**EN** | [DE](README_de.md)

The MCP **client is the reasoner** (no API key, model-agnostic): it calls `capture`
to see the screen, then acts with `do` / `click_name` / `invoke`. This is the keyless
Mode-A loop of open-compute, but as native tool-calls.

> This package is a **thin launcher**. It contains no server logic — it spawns the
> **Python** open-compute server (pulled from GitHub) and pipes MCP stdio through.
> Real screen capture and input require the **interactive Windows desktop session**.

## Requirements

- **Python 3.10+** and **[uv](https://docs.astral.sh/uv/)** on the host. The default
  launch uses `uvx` to fetch open-compute (with the `mcp` extra) **from GitHub** on
  first run — the `mcp` extra tracks the GitHub repo, so this works regardless of
  PyPI release timing.
- **Windows** for real capture/input (mss + UIA). Other platforms import the tools
  but cannot drive a desktop.

## Tools

| Tool | Purpose |
|---|---|
| `capture` | Screenshot the screen → returned as an image (optionally a single window). |
| `do` | Execute one canonical action or a batch (click/type/key/scroll/drag/…). |
| `tree` | List UI elements via Windows UIA (name/role/`center_norm`). |
| `click_name` | Resolve an element by name and click it. |
| `invoke` | Click-free activation of an element via UIA patterns. |
| `watch_dir` | Watch directories for file-system changes. |
| `push_status` | Feed-manager status (read-only). |
| `rec_replay` | Replay a `.clirec` macro (needs the optional `clirec` package). |

All coordinates are **normalized 0..1** relative to the virtual desktop. Tool
descriptions are localized in six languages (`de/en/es/ja/ru/zh`) via `OC_LANGUAGE`.

## Use with an MCP client

**Via this npm launcher (npx):**

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

**Directly via Python (uvx), no npm:**

```json
{
  "mcpServers": {
    "open-compute": {
      "command": "uvx",
      "args": ["--from", "open-compute[mcp,local,uia] @ git+https://github.com/ellmos-ai/open-compute.git", "open-compute-mcp"]
    }
  }
}
```

## Configuration (environment variables)

| Variable | Effect |
|---|---|
| `OPEN_COMPUTE_PYTHON` | Path to a `python.exe`; the launcher runs `-m open_compute.mcp_server` with it (use this if you installed open-compute into a specific environment). |
| `OPEN_COMPUTE_MCP_CMD` | Full command override (whitespace-split), e.g. `python -m open_compute.mcp_server`. |
| `OPEN_COMPUTE_GIT_REF` | Git ref (branch/tag/sha) to pin for the uvx launch (default: the repo's default branch). |
| `OPEN_COMPUTE_EXTRAS` | Extras for the default `uvx` launch (default `mcp,local,uia`). |
| `OC_LANGUAGE` | Language of the tool descriptions: `de`/`en`/`es`/`ja`/`ru`/`zh`. |
| `OC_SAFETY_MODE` | `confirm` (default) · `read_only` · `allow_all`. |
| `OC_DENY` | Comma-separated action types always denied (e.g. `type,launch_app`). |

## Safety

Computer-use is powerful. `OC_SAFETY_MODE` is an operator **ceiling** (`confirm`
default · `read_only` · `allow_all`); a per-call `mode` can only *tighten* it, never
loosen it. Because MCP stdio has no server→client confirm callback, `confirm` /
`read_only` **report** an action without performing it. For interactive use, run in
an **isolated VM/session**, set `OC_SAFETY_MODE=allow_all`, and let your client's
tool-approval dialog be the human-in-the-loop. `OC_DENY` (comma-separated action
types) is a hard deny list. Treat on-screen content as untrusted (prompt-injection
risk).

## License

MIT — see [LICENSE](LICENSE). Part of the open-compute project.
