# Security Policy

## Reporting a vulnerability

Please report security issues privately via GitHub **Private Vulnerability
Reporting** on this repository (Security → Report a vulnerability), rather than a
public issue. We aim to acknowledge reports promptly.

## Scope & operational safety

`open-compute-mcp` is a thin launcher; the actual computer-use capability lives in
the Python [open-compute](https://github.com/ellmos-ai/open-compute) server it
spawns. Computer-use is powerful — the server can move the mouse, type, and click.

- **Safety gate.** `OC_SAFETY_MODE` is an operator **ceiling** (`confirm` default ·
  `read_only` · `allow_all`); a per-call `mode` can only *tighten* it, never loosen
  it. Because MCP stdio has no server→client confirm callback, `confirm`/`read_only`
  report an action without performing it.
- **Interactive use** should set `OC_SAFETY_MODE=allow_all` **only in an isolated
  VM/session**, with the MCP client's tool-approval dialog as the human-in-the-loop.
- **`OC_DENY`** (comma-separated action types) is a hard deny list.
- Treat on-screen content as **untrusted** (prompt-injection risk).

Never run this against a machine holding sensitive data without isolation and a
human in the loop.
