# Third-party license information

Reviewed: 2026-10-12.

The repository's own license is MIT; see [LICENSE](LICENSE). This page records the npm package's declared direct runtime dependency as listed in `package.json`. It is a limited inventory, not a complete software bill of materials, legal opinion, or license review of the separately fetched Python server, Node.js distribution, transitive dependencies, build tools, or deployment environment.

## Declared direct runtime dependency

| Package | Version range | Declared license | Role |
|---|---:|---|---|
| [`update-notifier`](https://www.npmjs.com/package/update-notifier) | `^7.3.1` | BSD-2-Clause | Optional update notice in an interactive terminal |

The package is installed from npm and is not vendored in this repository. Consult its distributed license and notices when redistributing it. The launcher may perform an update check in an interactive terminal; the default `uvx` command separately downloads the Python project from GitHub.

## Scope of the selected inventory

The Python `open-compute` server is a separate project launched as a child process. Its dependencies and notices are outside this npm repository's direct-dependency list. The same applies to transitive npm dependencies and components bundled with a particular Node.js runtime. Review the license files and notices for the exact components used in any distribution or deployment.

No blanket claim is made here about copyleft absence, compatibility with a particular business use, or compliance of a downstream bundle.
