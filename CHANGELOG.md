# Changelog

All notable changes to this package are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the
project adheres to [Semantic Versioning](https://semver.org/).

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
