"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const launcher = path.join(root, "bin", "open-compute-mcp.js");
const fixture = path.join("test", "fixtures", "success-child.fixture");

test("OPEN_COMPUTE_MCP_CMD launches the configured child command", () => {
  const result = spawnSync(process.execPath, [launcher], {
    cwd: root,
    env: {
      ...process.env,
      OPEN_COMPUTE_MCP_CMD: `node ${fixture} expected-arg`,
      OPEN_COMPUTE_PYTHON: "",
    },
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stderr, /OPEN_COMPUTE_MCP_CMD override reached fixture/);
});

test("resolveLaunch pins default git ref to version tag when OPEN_COMPUTE_GIT_REF is unset", () => {
  const { resolveLaunch } = require("../bin/open-compute-mcp.js");
  const pkgVersion = require("../package.json").version;
  const launch = resolveLaunch({});

  assert.equal(launch.cmd, "uvx");
  assert.equal(launch.how, "uvx (github)");
  assert.equal(launch.args[0], "--from");
  assert.match(launch.args[1], new RegExp(`git\\+https://github\\.com/ellmos-ai/open-compute\\.git@v${pkgVersion.replace(/\./g, "\\.")}$`));
});

test("resolveLaunch respects custom OPEN_COMPUTE_GIT_REF override", () => {
  const { resolveLaunch } = require("../bin/open-compute-mcp.js");
  const launch = resolveLaunch({ OPEN_COMPUTE_GIT_REF: "main" });

  assert.equal(launch.cmd, "uvx");
  assert.match(launch.args[1], /git\+https:\/\/github\.com\/ellmos-ai\/open-compute\.git@main$/);
});


