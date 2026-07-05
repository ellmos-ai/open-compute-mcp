#!/usr/bin/env node
"use strict";

/**
 * npm launcher for the open-compute MCP server.
 *
 * This is a thin wrapper: it spawns the Python MCP server (open-compute[mcp])
 * and pipes MCP stdio (stdin/stdout/stderr) straight through. It contains NO
 * server logic — the reasoning, capture and input all happen in the Python
 * process, which requires the interactive Windows desktop session.
 *
 * Launch resolution (first match wins):
 *   1. OPEN_COMPUTE_MCP_CMD  — full command override, e.g.
 *      "C:\\path\\to\\python.exe -m open_compute.mcp_server"
 *   2. OPEN_COMPUTE_PYTHON   — a python executable; run its -m open_compute.mcp_server
 *   3. uvx (default)         — launches open-compute from GitHub via uv:
 *      uvx --from "open-compute[<extras>] @ git+https://github.com/ellmos-ai/open-compute.git@<ref>" open-compute-mcp
 *      extras default "mcp,local,uia" (OPEN_COMPUTE_EXTRAS); ref defaults to the
 *      repo's default branch (set OPEN_COMPUTE_GIT_REF to pin a branch/tag/sha).
 *      The mcp extra tracks the GitHub repo, so the launcher pulls open-compute
 *      from GitHub regardless of PyPI timing.
 *
 * Requires Python + uv on the host (uvx pulls open-compute from GitHub on first
 * run). Windows-only for real capture/input.
 */

const { spawn } = require("node:child_process");

// Terminal-only update notice — TTY-guarded so it never corrupts the stdio MCP
// protocol (matches the ellmos MCP server convention). Never blocks startup.
if (process.stdout.isTTY) {
  import("update-notifier")
    .then(({ default: notifier }) => notifier({ pkg: require("../package.json") }).notify())
    .catch(() => {});
}

function tokenize(cmdline) {
  // Minimal whitespace split; quote a path via OPEN_COMPUTE_PYTHON instead if it
  // contains spaces.
  return cmdline.split(/\s+/).filter(Boolean);
}

function resolveLaunch() {
  const override = process.env.OPEN_COMPUTE_MCP_CMD;
  if (override && override.trim()) {
    const parts = tokenize(override.trim());
    return { cmd: parts[0], args: parts.slice(1), how: "OPEN_COMPUTE_MCP_CMD" };
  }
  const py = process.env.OPEN_COMPUTE_PYTHON;
  if (py && py.trim()) {
    return { cmd: py.trim(), args: ["-m", "open_compute.mcp_server"], how: "OPEN_COMPUTE_PYTHON" };
  }
  const extras = (process.env.OPEN_COMPUTE_EXTRAS || "mcp,local,uia").trim();
  const ref = (process.env.OPEN_COMPUTE_GIT_REF || "").trim();
  const refSuffix = ref ? `@${ref}` : ""; // empty -> uv uses the repo's default branch
  // Launch open-compute from GitHub (PEP 508 "name[extras] @ git+URL").
  const spec = `open-compute[${extras}] @ git+https://github.com/ellmos-ai/open-compute.git${refSuffix}`;
  return {
    cmd: "uvx",
    args: ["--from", spec, "open-compute-mcp"],
    how: "uvx (github)",
  };
}

const { cmd, args, how } = resolveLaunch();

const child = spawn(cmd, args, { stdio: "inherit", windowsHide: true });

child.on("error", (err) => {
  process.stderr.write(
    `[open-compute-mcp] failed to launch the Python server via ${how} ('${cmd}'): ${err.message}\n` +
      "Ensure Python and open-compute[mcp] are installed, or set OPEN_COMPUTE_PYTHON " +
      "(a python.exe) or OPEN_COMPUTE_MCP_CMD (a full command). Real capture/input is Windows-only.\n"
  );
  process.exit(127);
});

child.on("exit", (code, signal) => {
  if (signal) {
    // Re-raise the terminating signal so the parent's exit status is faithful.
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code == null ? 0 : code);
});

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    try {
      child.kill(sig);
    } catch (_) {
      /* child already gone */
    }
  });
}
