# Third-Party License Review

Stand: 2026-09-20.

## Runtime dependencies

| Package | Version checked | License | Use |
|---|---:|---|---|
| `update-notifier` | 7.3.1 | BSD-2-Clause | Non-intrusive interactive CLI update notification (TTY-guarded) |

The npm package does not vendor these dependencies; they are installed by npm from their registry packages.

## Reviewed but not vendored / Architecture references

| Source | License | Decision |
|---|---|---|
| `modelcontextprotocol/servers` | MIT | Reference architecture for stdio MCP protocol transport; no code copied. |
| `anthropic/computer-use-demo` | MIT | Concept reference for coordinate normalization and action dispatch; no code copied. |
| `open-compute` (Python) | MIT | Core Python engine spawned as a separate process via `uvx` / python; decoupled via stdio JSON-RPC. |

## Permissive License Compatibility & Invariants

All runtime and developmental dependencies are distributed under strictly permissive open-source licenses (MIT and BSD-2-Clause).

1. **Zero Copyleft**: Contains no GPL, AGPL, or restrictive copyleft components.
2. **Local-First & Zero-Egress**: Operates strictly offline over local stdio JSON-RPC with 0 network telemetry (`INV-LOCAL-01`).
3. **Unprivileged Execution**: Operates strictly within user-space as `RunAsInvoker` with 0 administrative elevation requirements (`INV-PROC-07`).
4. **Governance & Security SLA**: Full compliance with the open-bricks / ellmos-ai 48h Security Response and 5-day Triage SLA (`INV-SLA-10`).

Implementation note: this MCP server is a lightweight Node.js launcher that proxies stdio JSON-RPC to the Python `open-compute` backend. It carries no vendored binary dependencies and introduces no proprietary or restrictive copyleft dependencies.
