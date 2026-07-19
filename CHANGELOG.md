# Changelog

All notable changes to this package are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
