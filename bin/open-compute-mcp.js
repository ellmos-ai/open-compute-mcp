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

// Half-size captures by default. This launcher only ever serves agents, which
// load every frame into a paid context window — and the frames stay there, so a
// full-HD grab is charged again on each following request. open-compute's
// coordinates are normalized 0..1, so halving the image costs nothing in click
// accuracy; only fine text gets harder to read. Set OC_CAPTURE_SCALE=1.0 for the
// full resolution. The Python library itself stays unscaled: its callers are not
// necessarily paying per pixel.
const DEFAULT_CAPTURE_SCALE = "0.5";

function applyCaptureDefaults(env = process.env) {
  if (env.OC_CAPTURE_SCALE === undefined && env.OC_CAPTURE_MAX_DIM === undefined) {
    env.OC_CAPTURE_SCALE = DEFAULT_CAPTURE_SCALE;
    return true;
  }
  return false;
}

function resolveLaunch(env = process.env) {
  const override = env.OPEN_COMPUTE_MCP_CMD;
  if (override && override.trim()) {
    const parts = tokenize(override.trim());
    return { cmd: parts[0], args: parts.slice(1), how: "OPEN_COMPUTE_MCP_CMD" };
  }
  const py = env.OPEN_COMPUTE_PYTHON;
  if (py && py.trim()) {
    return { cmd: py.trim(), args: ["-m", "open_compute.mcp_server"], how: "OPEN_COMPUTE_PYTHON" };
  }
  const extras = (env.OPEN_COMPUTE_EXTRAS || "mcp,local,uia").trim();
  const rawRef = env.OPEN_COMPUTE_GIT_REF;
  // Default: the open-compute default branch (master) — the launcher always
  // serves the current features. Pin a release tag (e.g. "v0.7.0-alpha") or
  // any branch/sha via OPEN_COMPUTE_GIT_REF. (Previously this defaulted to
  // `v<npm package version>` — a tag that never existed in open-compute, so
  // the default launch was broken.)
  const ref = rawRef !== undefined ? rawRef.trim() : "master";
  const refSuffix = ref ? `@${ref}` : "";
  // Launch open-compute from GitHub (PEP 508 "name[extras] @ git+URL").
  const spec = `open-compute[${extras}] @ git+https://github.com/ellmos-ai/open-compute.git${refSuffix}`;
  return {
    cmd: "uvx",
    args: ["--from", spec, "open-compute-mcp"],
    how: "uvx (github)",
  };
}

if (require.main === module) {
  const { cmd, args, how } = resolveLaunch();
  const scaled = applyCaptureDefaults();

  if (scaled && process.stdout.isTTY) {
    process.stderr.write(
      `[open-compute-mcp] captures scaled to ${DEFAULT_CAPTURE_SCALE} to cut vision-token cost; ` +
        "coordinates are normalized so clicking is unaffected. Set OC_CAPTURE_SCALE=1.0 for full resolution.\n"
    );
  }

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
} else {
  module.exports = { resolveLaunch, applyCaptureDefaults, DEFAULT_CAPTURE_SCALE };
}

