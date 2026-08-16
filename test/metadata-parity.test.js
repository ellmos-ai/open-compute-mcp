"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function readJson(file) {
  const filePath = path.join(root, file);
  assert.ok(fs.existsSync(filePath), `${file} should exist`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(file) {
  const filePath = path.join(root, file);
  assert.ok(fs.existsSync(filePath), `${file} should exist`);
  return fs.readFileSync(filePath, "utf8");
}

test("version parity across manifests (package.json, server.json, glama.json)", () => {
  const pkg = readJson("package.json");
  const server = readJson("server.json");
  const glama = readJson("glama.json");

  assert.ok(pkg.version, "package.json must have a version");
  assert.equal(server.version, pkg.version, "server.json version must match package.json");
  assert.equal(glama.version, pkg.version, "glama.json version must match package.json");
  assert.equal(
    server.packages[0].version,
    pkg.version,
    "server.json package entry version must match package.json"
  );
});

test("package.json files list includes all canonical distribution files", () => {
  const pkg = readJson("package.json");
  const requiredFiles = [
    "bin/",
    "README.md",
    "README_de.md",
    "CHANGELOG.md",
    "SECURITY.md",
    "LICENSE",
    "server.json",
    "glama.json",
    "smithery.yaml",
    "llms.txt",
  ];

  for (const req of requiredFiles) {
    assert.ok(
      pkg.files.includes(req),
      `package.json files array must include ${req}`
    );
    const target = path.join(root, req);
    assert.ok(
      fs.existsSync(target),
      `Included file or directory ${req} must exist on disk`
    );
  }
});

test("documentation files are valid UTF-8 and contain no replacement chars", () => {
  const docFiles = [
    "README.md",
    "README_de.md",
    "CHANGELOG.md",
    "SECURITY.md",
    "llms.txt",
  ];

  for (const doc of docFiles) {
    const content = readText(doc);
    assert.ok(content.length > 0, `${doc} must not be empty`);
    assert.equal(
      content.includes("\uFFFD"),
      false,
      `${doc} must not contain replacement character U+FFFD`
    );
  }
});

test("llms.txt metadata and timestamp consistency", () => {
  const llms = readText("llms.txt");
  assert.match(llms, /# open-compute-mcp/, "llms.txt must have correct title");
  assert.match(llms, /## Last-checked:\s*2026-08-16/, "llms.txt must have 2026-08-16 last-checked timestamp");
  assert.match(llms, /## Tools/, "llms.txt must document tools");
  assert.match(llms, /## Safety/, "llms.txt must document safety modes");
});
