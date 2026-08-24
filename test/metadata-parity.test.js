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
    "THIRD_PARTY_LICENSES.md",
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
    "THIRD_PARTY_LICENSES.md",
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
  assert.match(llms, /## Last-checked:\s*2026-08-24/, "llms.txt must have 2026-08-24 last-checked timestamp");
  assert.match(llms, /## Tools\s*\(16\)/, "llms.txt must document 16 tools");
  assert.match(llms, /## Safety/, "llms.txt must document safety modes");
  assert.match(llms, /- signal_show:/, "llms.txt must document signal_show tool");
  assert.match(llms, /- signal_abort:/, "llms.txt must document signal_abort tool");
  assert.match(llms, /- talk:/, "llms.txt must document talk tool");
});

test("glama.json tools count and features consistency", () => {
  const glama = readJson("glama.json");
  assert.equal(glama.tools.count, 16, "glama.json tool count must be 16");
  assert.ok(glama.keywords.includes("signal-overlay"), "glama.json keywords must include signal-overlay");
  assert.ok(glama.keywords.includes("push-to-talk"), "glama.json keywords must include push-to-talk");
  assert.ok(
    glama.features.some((f) => f.includes("signal overlay")),
    "glama.json features must mention signal overlay"
  );
});

test("bilingual security policy presence and contact integrity", () => {
  const sec = readText("SECURITY.md");
  assert.match(sec, /# Security Policy \/ Sicherheitsrichtlinie/, "SECURITY.md must have bilingual header");
  assert.match(sec, /## English/, "SECURITY.md must contain English section");
  assert.match(sec, /## Deutsch/, "SECURITY.md must contain German section");
  assert.match(sec, /security@ellmos\.ai/, "SECURITY.md must contain security@ellmos.ai");
  assert.match(sec, /support@lukasgeiger\.com/, "SECURITY.md must contain support@lukasgeiger.com");
  assert.match(sec, /OC_SAFETY_MODE/, "SECURITY.md must explain OC_SAFETY_MODE");
});

test("mermaid lifecycle sequence diagrams in both README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  assert.match(enReadme, /```mermaid[\s\S]*?sequenceDiagram/, "README.md must have sequence diagram");
  assert.match(deReadme, /```mermaid[\s\S]*?sequenceDiagram/, "README_de.md must have sequence diagram");
  assert.match(enReadme, /Safe Interaction & Signal Lifecycle/, "README.md must have signal lifecycle heading");
  assert.match(deReadme, /Sichere Interaktion & Signal-Lebenszyklus/, "README_de.md must have German signal lifecycle heading");
});

test("badges and quick navigation parity across README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  assert.match(enReadme, /Quick Navigation/, "README.md must include Quick Navigation");
  assert.match(deReadme, /Schnellnavigation/, "README_de.md must include Schnellnavigation");
  assert.match(enReadme, /tests-21%20passed-brightgreen\.svg/, "README.md must link 21 passed tests badge");
  assert.match(deReadme, /tests-21%20passed-brightgreen\.svg/, "README_de.md must link 21 passed tests badge");
  assert.match(enReadme, /Zero--Egress/, "README.md must include Zero-Egress badge");
  assert.match(deReadme, /Zero--Egress/, "README_de.md must include Zero-Egress badge");
});

test("third party licenses inventory documentation integrity", () => {
  const licenses = readText("THIRD_PARTY_LICENSES.md");
  assert.match(licenses, /# Third-Party License Review/, "THIRD_PARTY_LICENSES.md must have title");
  assert.match(licenses, /Stand:\s*2026-08-24/, "THIRD_PARTY_LICENSES.md must have current review date");
  assert.match(licenses, /update-notifier/, "THIRD_PARTY_LICENSES.md must list update-notifier");
  assert.match(licenses, /BSD-2-Clause/, "THIRD_PARTY_LICENSES.md must list BSD-2-Clause license");
});


