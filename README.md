<p align="center">
  <img src="https://raw.githubusercontent.com/ellmos-ai/open-compute-mcp/main/assets/wappen.jpg" alt="open-compute MCP server emblem" width="300">
</p>

# open-compute-mcp

> npm launcher for the Python [open-compute MCP server](https://github.com/ellmos-ai/open-compute). It forwards MCP JSON-RPC over local stdin/stdout. Real screen capture and input require an interactive Windows desktop on the MCP client's host. No Glama or other hosted/cloud desktop deployment is provided.

This short entrypoint replaces the long-form [README.md at predecessor commit 59cd953](https://github.com/ellmos-ai/open-compute-mcp/blob/59cd9530688b02c38b75d1926d5a1efdd1a4aa06/README.md). The corrected detailed guide is [archived here](docs/archive/README-2026-10-12.md), retaining the former section anchors and diagrams. It is a corrected copy, not an unchanged historical snapshot; the original remains available at the commit link.

[![CI](https://github.com/ellmos-ai/open-compute-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/ellmos-ai/open-compute-mcp/actions/workflows/ci.yml) [![npm version](https://img.shields.io/npm/v/open-compute-mcp.svg)](https://www.npmjs.com/package/open-compute-mcp) [![Tests: node --test](https://img.shields.io/badge/tests-53%20passed%20%7C%20100%25-brightgreen.svg)](test/) [![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/) [![License: MIT](https://img.shields.io/github/license/ellmos-ai/open-compute-mcp.svg)](LICENSE) [![MCP Server](https://img.shields.io/badge/MCP-server-blue.svg)](https://modelcontextprotocol.io) [![Product Skill](https://img.shields.io/badge/Skill-SKILL.md-teal.svg)](SKILL.md) [![Verified: 2026-11-26](https://img.shields.io/badge/verified-2026--11--26-blue.svg)](CHANGELOG.md) [![LLM Context](https://img.shields.io/badge/LLM-llms.txt-blue.svg)](llms.txt)

**EN** | [Deutsch](README_de.md) | [Español](README_es.md) | [Français](README_fr.md) | [Português](README_pt.md) | [Русский](README_ru.md) | [简体中文](README_zh.md) | [日本語](README_ja.md) | [العربية](README_ar.md) | [हिन्दी](README_hi.md) | [বাংলা](README_bn.md)

## Install and run

Requires Node.js 18 or newer and `uv`. The backend requires Python 3.10 or newer; `uvx` can use a compatible installed interpreter or download and manage one when needed. The default launch fetches the Python server from GitHub at the `master` branch; set `OPEN_COMPUTE_GIT_REF` to choose a branch, tag, or commit. These bootstrap steps require network access.

Add this server to a local MCP client:

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

The npm package is published separately from this Git repository; check its published version for a particular source revision. A direct `uvx` configuration is in the [detailed quick start](docs/archive/README-2026-10-12.md#sec-03).

### Install with your LLM

Copy this prompt into your AI coding assistant to configure and verify `open-compute-mcp` cleanly:

```text
Read llms.txt and SKILL.md for ellmos-ai/open-compute-mcp. Configure "open-compute" in my local MCP client using command "npx" and args ["-y", "open-compute-mcp"], keep OC_CAPTURE_SCALE=0.5 unless full resolution is required, and verify the launcher logic offline with `npm test` in a local clone.
```

## Architecture & Protocol Flow

The launcher resolves the backend target (`OPEN_COMPUTE_MCP_CMD` -> `OPEN_COMPUTE_PYTHON` -> `uvx`), applies `OC_CAPTURE_SCALE=0.5` by default to reduce vision-token overhead while preserving normalized `0..1` click coordinates, and bridges client JSON-RPC requests across local stdio to the Python engine on the interactive Windows desktop:

<p align="center">
  <img src="assets/terminal-workflow.svg" alt="open-compute-mcp terminal workflow preview" width="840">
</p>

```mermaid
flowchart LR
    Client["MCP Client (stdio JSON-RPC)"] --> Launcher["open-compute-mcp Launcher"]
    Launcher -->|"applyCaptureDefaults(): OC_CAPTURE_SCALE=0.5"| Resolve{"resolveLaunch()"}
    Resolve -->|"1. OPEN_COMPUTE_MCP_CMD"| Custom["Custom Backend Command"]
    Resolve -->|"2. OPEN_COMPUTE_PYTHON"| LocalPy["Local Python (-m open_compute.mcp_server)"]
    Resolve -->|"3. Default uvx (OPEN_COMPUTE_GIT_REF)"| Uvx["uvx from GitHub (mcp,local,uia)"]
    Custom --> Desktop["Windows Desktop (WGC / UIA / Win32)"]
    LocalPy --> Desktop
    Uvx --> Desktop
```

```mermaid
sequenceDiagram
    autonumber
    actor Reasoner as AI Reasoner (Antigravity / Claude / Cursor)
    participant Launcher as Node.js Launcher (open-compute-mcp)
    participant Engine as Python MCP Server (open-compute via uvx)
    participant Desktop as Windows Desktop (WGC / UIA / Win32)
    actor Operator as Human Operator (Supervision & Approvals)

    Note over Reasoner,Operator: Phase 1 - Transport Initialization & Tool Discovery
    Reasoner->>Launcher: MCP stdio JSON-RPC (initialize / tools/list)
    Launcher->>Engine: Spawn Python process & pipe stdio
    Engine-->>Launcher: Return tool schemas (capture, tree, do, click_name)
    Launcher-->>Reasoner: Forward available tool definitions

    Note over Reasoner,Operator: Phase 2 - Desktop Inspection & Visual Context
    Reasoner->>Launcher: Call capture(window?) or tree()
    Launcher->>Engine: Forward tool invocation over stdio
    Engine->>Desktop: Windows Graphics Capture (WGC) or UI Automation inspect
    Desktop-->>Engine: Raw frame buffer / accessibility element tree
    Engine-->>Launcher: Formatted image (base64 PNG) or JSON tree result
    Launcher-->>Reasoner: Relay visual context to model

    Note over Reasoner,Operator: Phase 3 - Human Oversight & Gated Action Execution
    Reasoner->>Launcher: Propose action: do(click, x, y) or click_name(target)
    Launcher->>Engine: Forward action request over stdio
    alt Client Approval Gate
        Operator->>Engine: Confirm interactive desktop action
        Engine->>Desktop: Synthesize mouse / keyboard event via Win32 API
        Desktop-->>Engine: Action outcome & state change
        Engine-->>Launcher: Success status report
    else Deny or Boundary Check
        Engine-->>Launcher: Action blocked by policy or client denial
    end
    Launcher-->>Reasoner: Forward execution receipt
```

## What the launcher does

It starts the Python MCP server and forwards stdio. The wrapper does not implement a network filter, sandbox, privilege drop, or environment scrubber. The child inherits the launcher's environment and operating-system privileges.

The default `uvx` command retrieves the Python project from GitHub; npm installation contacts npm. In an interactive terminal, the optional update notice may check npm. Local stdio describes the client-to-wrapper transport; it does not block network access by the child or MCP client. The client controls routing of tool results, including screenshots.

For real capture and input, run the MCP client on the Windows desktop to be controlled. Action modes and targeting belong to the Python server; configure the client's approval controls. This wrapper is not an operating-system security boundary.

## Tools and configuration

The [tool reference](docs/archive/README-2026-10-12.md#sec-04) is a snapshot of the separate Python project's tool list at a documented source ref. The running server's schemas define the available tools for the selected ref. See also the [environment variables](docs/archive/README-2026-10-12.md#sec-05).

## Related integration

The [Cowork Protocol Desktop Companion](https://github.com/ellmos-ai/cowork-protocol/blob/main/apps/desktop-companion/README.md) includes an optional, human-started computer-use adapter that launches the separate Python Open Compute MCP server over local stdio. Its documented default uses `uvx`; this npm launcher is not a Cowork dependency. This relationship does not change the process, network, or privilege boundaries described above.

## Target audiences & use cases

| Audience | Primary Goal | Key Entrypoint / Knob |
|---|---|---|
| **Windows Desktop Agent Builders** | Connect Claude, Cursor, or Antigravity to live Windows WGC/UIA automation | `npx -y open-compute-mcp` (`stdio`) |
| **Token-Conscious Multi-Agent Operators** | Cut screenshot vision-token cost without losing normalized `0..1` click precision | Default `OC_CAPTURE_SCALE=0.5` |
| **Accessibility & UIA Test Engineers** | Inspect Windows UI Automation element trees (`tree`, `click_name`, `invoke`) | `OPEN_COMPUTE_EXTRAS=mcp,local,uia` |
| **Offline / Pinned-Env Integrators** | Run a preinstalled Python environment or pinned Git ref reproducibly | `OPEN_COMPUTE_PYTHON` / `OPEN_COMPUTE_GIT_REF` |

## Documentation

- [Product Skill (for AI Agents & Humans)](SKILL.md)
- [LLM Context Index (`llms.txt`)](llms.txt) · [Compatibility Pointer (`llm.txt`)](llm.txt)
- [Architecture and behavior scope](docs/archive/README-2026-10-12.md#sec-01)
- [Security and network scope](docs/archive/README-2026-10-12.md#sec-12)
- [Selected dependency inventory](THIRD_PARTY_LICENSES.md)
- [Security reporting policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

The repository source manifest currently declares `0.1.0-alpha.20`. This documentation work changes no version and publishes no release.

---

*Concept & Approval: Geiger · Text assistance: LLM-assisted · Graphics: SVG-generated*
