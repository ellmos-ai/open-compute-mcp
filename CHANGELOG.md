# Changelog

All notable changes to this package are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the
project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0-alpha.18] - 2026-08-21

### Pre-action Countdown Contract

- Documented the open-compute v0.9 pre-action phase: configurable static grace
  color, once-per-second `Start in N Sekunden` text, and a single transition to
  the selected mode color at zero.
- Documented `signal_show` / `signal_status` phase, remaining-seconds, current
  color, and accessibility-label fields, including the `0`-second path.
- Added `OC_SIGNAL_GRACE_SECONDS` and `OC_SIGNAL_CONFIG` to both environment
  tables and updated both sequence diagrams and `llms.txt` without publishing
  the npm package.

## [0.1.0-alpha.17] - 2026-08-21

### Safe Interaction Contract Parity

- Documented open-compute v0.8 stable window/process IDs and issued window
  tokens, one-shot capture/tree observation IDs, observe-one-action-refresh,
  and automatic post-action observations.
- Documented exact-first UIA targeting with ambiguity/score reporting and
  verified segmented text input with focus and character-count postconditions.
- Documented owner/session signal leases, bounded TTL, automatic turn-end/error/
  abort cleanup, and the explicit `keep_signal=true` extension.
- Updated EN/DE tool tables, sequence diagrams, environment variables, and
  `llms.txt`. No npm publication was performed by this change.

## [0.1.0-alpha.16] - 2026-08-24

### Security & Dependency Hygiene Audit
- **Third-Party License Review (`THIRD_PARTY_LICENSES.md`)**: Created comprehensive third-party license inventory auditing runtime dependencies (`update-notifier` 7.3.1 BSD-2-Clause) and reference architecture boundaries.
- **Repository Hygiene & `.gitignore` Hardening**: Added explicit exclusion patterns for host sync conflicts (`*-WORKSTATION-LG*`, `*-ASUS-GEI*`, `*.conflict`, `*.sync-conflict-*`) and lock files (`LOCK*.txt`).
- **Packaging & Manifest Parity**: Synchronized `package.json` `files` distribution array to include `THIRD_PARTY_LICENSES.md`.
- **Contract Tests**: Expanded automated test suites in `test/repository-hygiene.test.js` and `test/metadata-parity.test.js` with license inventory parity and sync-conflict ignore contract tests (21/21 tests passing).
- **Metadata & Documentation**: Synchronized `llms.txt` last-checked timestamp to `2026-08-24` and README test badges to 21 passed.

## [0.1.0-alpha.16] - 2026-08-21

### Discoverability, UX Design & Security Parity
- **Visual Signal Overlay & Abort Sequence Diagram**: Added interactive bilingual Mermaid sequence diagram (`Safe Interaction & Signal Lifecycle` / `Sichere Interaktion & Signal-Lebenszyklus`) illustrating the 4-phase interaction flow (Visual Perception, Signal Overlay Activation, Action Request & Safety Gate, Emergency Abort / Auto-Release of Hold Primitives).
- **Key Capabilities Overview**: Restructured documentation into 4 distinct pillars (Visual Perception & Window Targeting, Safety-Gated Action Execution, Visual Signal Overlay & Abort Control, Multimodal Collaboration & Voice Notes).
- **Bilingual Hardened Security Policy (`SECURITY.md`)**: Expanded with German section, Local-First & Zero-Egress stdio invariants, User-Mode Non-Elevation guarantees, hold-primitive auto-release on shutdown, and direct security contact endpoints (`security@ellmos.ai` & `support@lukasgeiger.com`).
- **Tool Parity & Schema Sync (16 Tools)**: Synchronized 16 tools across `README.md`, `README_de.md`, `glama.json` (`count: 16`), and `llms.txt` (including `signal_show`, `signal_hide`, `signal_status`, `signal_abort`, `chat`, `talk`).
- **Ecosystem & Sibling Tooling Matrix**: Enriched sibling tools across `ellmos-ai`, `dev-bricks`, `file-bricks`, `doc-bricks`, and `open-bricks`.
- **Automated Contract Test Suite**: Expanded `test/metadata-parity.test.js` to 9 contract tests verifying bilingual security policy, Mermaid sequence diagrams, quick navigation, badges, and metadata parity (19/19 tests passing).
- **Index & Badges**: Updated `llms.txt` Last-checked timestamp to `2026-08-21` and synchronized badges with Privacy Zero-Egress, Security Safety-Gated, and 19 passed tests.

## [0.1.0-alpha.16] - 2026-08-16

### Discoverability & Metadata Parity
- Synchronized README badges (tests: 15 passed, version: 0.1.0-alpha.16, Node >=18, MCP server, LLM-ready).
- Implemented automated metadata, manifest and UTF-8 parity test suite in `test/metadata-parity.test.js` (4 tests).
- Synchronized `llms.txt` Last-checked timestamp to `2026-08-16`.

### Changed

- **Captures are now half-size by default** (`OC_CAPTURE_SCALE=0.5`). A vision model
  is billed per pixel and every frame stays in the conversation, so a full-HD grab is
  charged again on each following request — the cost of a session grows with the
  *square* of the screenshot count. open-compute's coordinates are normalized 0..1, so
  the smaller frame costs **nothing in click accuracy**; only fine text gets harder to
  read. A 1920×1080 grab drops from ~1600 to ~690 tokens.

  Set `OC_CAPTURE_SCALE=1.0` for the previous behaviour. Setting `OC_CAPTURE_MAX_DIM`
  also suppresses the default, so the two knobs never shrink twice. The launcher prints
  a one-line notice on a TTY when the default applies.

  Only this launcher opts in — the Python library still defaults to full resolution,
  since its callers are not necessarily paying per pixel. Requires open-compute with
  the capture-budget knobs (`ellmos-ai/open-compute` ≥ commit `5905ef7`).

## [0.1.0-alpha.8] - 2026-07-31

### Fixed
- **Default git ref repaired:** the uvx launch defaulted to `v<npm package
  version>` — a tag that never existed in `ellmos-ai/open-compute` — so the
  default start could not resolve the package. The default is now the
  open-compute `master` branch (matching the README); pinning a release tag
  such as `v0.7.0-alpha` or any branch/sha still works via
  `OPEN_COMPUTE_GIT_REF`.

### Added
- README (EN+DE) documents the six new open-compute v0.7.0 tools:
  `signal_show` / `signal_hide` / `signal_status` / `signal_abort`
  (screen-usage signal overlay with abort hotkey), `chat` and `talk`
  (push-to-talk).

## [Unreleased] - 2026-07-29

### Discoverability & Visibility
- Added Glama.ai badges to `README.md` and `README_de.md` for ecosystem discovery.
- Added `glama.json` to `package.json` `files` whitelist and expanded package keywords (`computer-use-mcp`, `mcp-stdio`, `glama`).
- Updated unit test verification badge count to `6 passed` in `README.md` and `README_de.md`.
- Refreshed `llms.txt` verification timestamp to `2026-07-29`.
- Restored `package-lock.json` version parity with the `0.1.0-alpha.7` package metadata.
- Removed the unverified legacy `smithery.yaml`; current Smithery publication for local stdio servers requires a validated MCPB bundle.

## [0.1.0-alpha.7] - 2026-07-25

### Performance & Maintenance
- Refactor `bin/open-compute-mcp.js` launcher logic (`resolveLaunch`) to pin default `uvx` git ref to `v${version}` tag instead of unpinned main branch, reducing GitHub pull latencies on startup.
- Add unit tests in `test/launcher-command.test.js` verifying default version tag pinning and `OPEN_COMPUTE_GIT_REF` override support.
- Synchronize version string 0.1.0-alpha.7 across `package.json`, `package-lock.json`, `server.json`, `glama.json`.

## [0.1.0-alpha.6] - 2026-07-25

### Discoverability & SEO
- Updated `llms.txt` indexing metadata, search phrases, and timestamp to `2026-07-25`.
- Integrated Mermaid architecture & dataflow diagram into `README.md` and `README_de.md`.
- Added GitHub Alert callouts (`> [!NOTE]`) for LLM agents and RAG indexers.
- Added status & platform badges for test verification, MCP compatibility, and platform availability.

### Fixed
- Correct FileCommander (46) and CodeCommander (22) tool counts in the ecosystem family table; counts now verified against the live MCP `tools/list` surface.

## [0.1.0-alpha.5] - 2026-07-24

### Security

- Moved local MCP registry token files out of the OneDrive-synced repository root
  and expanded `.gitignore` / `.npmignore` coverage for local token, credential,
  recovery-code, private-key and certificate artifacts.
- Added a repository hygiene test for Git ignore rules, defensive npm ignore
  patterns and the package `files` whitelist.

### Added

- Added a launcher smoke test that verifies `OPEN_COMPUTE_MCP_CMD` runs the
  configured child command without falling through to the default `uvx` launch.
- Added `.mcpregistry_github_token` and `.mcpregistry_registry_token` to `.gitignore` to prevent accidental inclusion of local registry tokens.
- Added `llms.txt` to the `files` field in `package.json` to include it in the npm package payload.
- Updated `llms.txt` with a list of important files and the `Last-checked` status.

### Changed

- Synchronized the package lockfile root version with `package.json` at `0.1.0-alpha.4`.
- Ignored local automation protocol logs (`*-protocoll.txt`) in Git and npm packaging.

### Changed
- Unified the ellmos-ai ecosystem section in README.md and README_de.md: full 9-server MCP family table with refreshed tool counts, AI infrastructure, and desktop software links.
- Added `glama.json` for the Glama MCP directory listing.
- Synced `server.json` version metadata.

## [0.1.0-alpha.4] — 2026-07-06

### Changed

- README header: added npm version/downloads, license and Node badges plus a
  "View on npm" link (EN + DE).
- Banner reworked to a wider 16:3 band (edge-to-edge, less vertical padding) so it
  fills the README column.

## [0.1.0-alpha.3] — 2026-07-05

### Changed

- README banner: now a rendered PNG served via an absolute raw-GitHub URL at full
  width — it fills the GitHub README column and renders on the npm package page
  (npm shows neither SVG nor relative image paths). The SVG source stays in `assets/`.

## [0.1.0-alpha.2] — 2026-07-05

### Changed

- Registry namespace set to `io.github.lukisch/open-compute-mcp` (personal
  namespace, matching the existing registry entries) so the server publishes to
  the official MCP registry without requiring a public GitHub org membership.
  The `mcpName` in package.json is updated to match.

## [0.1.0-alpha.1] — 2026-07-05

### Added

- Initial release: npm launcher (`npx open-compute-mcp`) for the open-compute MCP
  server. Spawns the Python server and pipes MCP stdio through.
- Launches open-compute **from GitHub** via `uvx` (the `mcp` extra tracks the GitHub
  repo, so this works regardless of PyPI release timing); overridable with
  `OPEN_COMPUTE_PYTHON` / `OPEN_COMPUTE_MCP_CMD` / `OPEN_COMPUTE_GIT_REF` /
  `OPEN_COMPUTE_EXTRAS`.
- Faithful exit-code / signal pass-through and a clear error when Python/uv is
  missing.
- Terminal-only update notice (`update-notifier`, TTY-guarded so it never corrupts
  the stdio protocol).
- Tools exposed by the server: `capture`, `do`, `tree`, `click_name`, `invoke`,
  `watch_dir`, `push_status`, `rec_replay`. Tool descriptions localized in six
  languages (de/en/es/ja/ru/zh) via `OC_LANGUAGE`.
