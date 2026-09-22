# Third-Party License Review

Stand: 2026-09-22.

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

## Level 1 SBOM Transparency & Invariant Cross-Reference Matrix

| Invariant ID | Rule & Principle | Architectural Implementation File | Verification & Enforcement Guarantee |
|---|---|---|---|
| `INV-LOCAL-01` | **Zero-Egress & Local Stdio** | `bin/open-compute-mcp.js` | 100% offline; executes purely over local stdio JSON-RPC without network telemetry |
| `INV-GATE-02` | **Fail-Closed Safety Ceiling** | `bin/open-compute-mcp.js` | `OC_SAFETY_MODE` (default: `confirm`) enforces operator ceiling; per-call can only tighten |
| `INV-OBS-03` | **One-Shot Observation Lifespan** | Python stdio engine | Single-use ephemeral observation tokens invalidated after 1 action |
| `INV-WIN-04` | **Strict Window Binding** | Python stdio engine | Window token verification before mouse/keyboard action; prevents background targeting |
| `INV-SIG-05` | **Leased Signal Overlay & Abort** | Python stdio engine | Visual countdown overlay with owner lease, TTL cleanup, and emergency hotkey abort |
| `INV-UIA-06` | **Exact-First Semantic Resolution** | Python stdio engine | Exact UIA element name matches resolved before heuristic fuzzy matches |
| `INV-PROC-07` | **Unprivileged RunAsInvoker Mode** | `package.json`, launcher | Operates strictly with standard user privileges; zero administrative elevation |
| `INV-CROSS-08` | **Multi-OS Stdio Protocol Parity** | `test/`, `.github/workflows/ci.yml` | Validated across Ubuntu, Windows, and macOS on Node.js 18.x, 20.x, 22.x, 24.x |
| `INV-SYNC-09` | **Multi-Agent Lock & Conflict Discipline** | `.gitignore`, `test/repository-hygiene.test.js` | Defensive gitignore rules prevent credential, lock, or sync conflict leakage |
| `INV-SLA-10` | **48h Security Response & 5-Day Triage SLA** | `SECURITY.md`, `README.md` | Binding 48h response commitment and 5-day triage via security@ellmos.ai |

## Permissive License Compatibility & Invariants

All runtime and developmental dependencies are distributed under strictly permissive open-source licenses (MIT and BSD-2-Clause).

1. **Zero Copyleft**: Contains no GPL, AGPL, or restrictive copyleft components.
2. **Local-First & Zero-Egress**: Operates strictly offline over local stdio JSON-RPC with 0 network telemetry (`INV-LOCAL-01`).
3. **Unprivileged Execution**: Operates strictly within user-space as `RunAsInvoker` with 0 administrative elevation requirements (`INV-PROC-07`).
4. **Governance & Security SLA**: Full compliance with the open-bricks / ellmos-ai 48h Security Response and 5-day Triage SLA (`INV-SLA-10`).

## Non-Elevation Certification (RunAsInvoker)

`open-compute-mcp` is designed and certified to execute entirely in unprivileged user mode (`RunAsInvoker`). It never requests, requires, or inherits elevated UAC administrator tokens under Windows or `sudo`/root privileges on POSIX platforms.

## Zero-Copyleft Isolation Guarantee

No components under GPL, AGPL, LGPL, SSPL, or other reciprocal copyleft licenses are bundled, linked, or vendored. The product is 100% compliant with commercial and enterprise environments requiring clean MIT / BSD-2-Clause permissive licensing.

Implementation note: this MCP server is a lightweight Node.js launcher that proxies stdio JSON-RPC to the Python `open-compute` backend. It carries no vendored binary dependencies and introduces no proprietary or restrictive copyleft dependencies.

