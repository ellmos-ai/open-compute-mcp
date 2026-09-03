# Third-Party License Review

Stand: 2026-08-24.

## Runtime dependencies

| Package | Version checked | License | Use |
|---|---:|---|---|
| `update-notifier` | 7.3.1 | BSD-2-Clause | Non-intrusive interactive CLI update notification |

The npm package does not vendor these dependencies; they are installed by npm from their registry packages.

## Reviewed but not vendored / Architecture references

| Source | License | Decision |
|---|---|---|
| `modelcontextprotocol/servers` | MIT | Reference architecture for stdio MCP protocol transport; no code copied. |
| `anthropic/computer-use-demo` | MIT | Concept reference for coordinate normalization and action dispatch; no code copied. |
| `open-compute` (Python) | MIT | Core Python engine spawned as a separate process via `uvx` / python; decoupled via stdio JSON-RPC. |

Implementation note: this MCP server is a lightweight Node.js launcher that proxies stdio JSON-RPC to the Python `open-compute` backend. It carries no vendored binary dependencies and introduces no proprietary or restrictive copyleft dependencies.
