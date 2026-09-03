"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function readRoot(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function globToRegex(pattern) {
  const clean = pattern.endsWith("/") ? pattern.slice(0, -1) : pattern;
  const escaped = clean
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$");
}

function isIgnored(samplePath) {
  if (fs.existsSync(path.join(root, ".git"))) {
    try {
      execFileSync("git", ["check-ignore", "--quiet", "--no-index", samplePath], {
        cwd: root,
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  }

  // Fallback when running outside a git clone (e.g. file-backed sync mirror)
  const gitignore = readRoot(".gitignore");
  if (samplePath === ".env.example" || samplePath === ".env.sample" || samplePath === "THIRD_PARTY_LICENSES.md") {
    return false;
  }
  const basename = path.basename(samplePath);
  for (const rawLine of gitignore.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const regex = globToRegex(line);
    if (regex.test(samplePath) || regex.test(basename)) {
      return true;
    }
  }
  return false;
}

test("gitignore protects local credential and registry-token artifacts", () => {
  for (const samplePath of [
    ".env",
    ".env.local",
    ".npmrc",
    "secrets.json",
    "credentials.json",
    "registry.token",
    "registry.tokens",
    "api.secret.json",
    "npm_recovery_codes.txt",
    "id_rsa",
    "id_ed25519",
    "client.key",
    "certificate.pem",
    "bundle.p12",
    ".mcpregistry_github_token",
    ".mcpregistry_registry_token",
    ".mcpregistry_local_token",
    "push-protocoll.txt",
    "changelog-protocoll.txt",
    "LOCK.txt",
    "LOCK.user.buildweek.txt",
    "foo.conflict",
    "foo.sync-conflict-20260824.js",
    "sample-WORKSTATION-LG.js",
    "sample-ASUS-GEI.js",
  ]) {
    assert.equal(isIgnored(samplePath), true, `${samplePath} should be ignored`);
  }

  assert.equal(isIgnored(".env.example"), false, ".env.example should stay trackable");
  assert.equal(isIgnored(".env.sample"), false, ".env.sample should stay trackable");
  assert.equal(isIgnored("THIRD_PARTY_LICENSES.md"), false, "THIRD_PARTY_LICENSES.md should stay trackable");
});

test("npm ignore keeps defensive secret patterns beside the files whitelist", () => {
  const npmignore = readRoot(".npmignore");
  for (const pattern of [
    ".npmrc",
    "*token*.json",
    "*recovery*codes*",
    "id_ed25519",
    "*.p12",
    ".mcpregistry_*_token",
    "*-protocoll.txt",
  ]) {
    assert.match(npmignore, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("package files whitelist contains no credential-like entries", () => {
  const pkg = JSON.parse(readRoot("package.json"));
  const files = pkg.files || [];
  const forbidden = [
    /\.mcpregistry/i,
    /\.env/i,
    /\.npmrc/i,
    /token/i,
    /secret/i,
    /credential/i,
    /recovery/i,
    /id_(rsa|dsa|ecdsa|ed25519)/i,
    /\.(key|pem|p12|pfx|crt|cer|der)$/i,
  ];

  for (const entry of files) {
    for (const pattern of forbidden) {
      assert.equal(pattern.test(entry), false, `${entry} must not be in package files`);
    }
  }
});

test("third party licenses inventory parity with runtime dependencies", () => {
  const pkg = JSON.parse(readRoot("package.json"));
  const licenses = readRoot("THIRD_PARTY_LICENSES.md");
  const deps = Object.keys(pkg.dependencies || {});

  assert.ok(licenses.includes("Stand:"), "THIRD_PARTY_LICENSES.md must contain review date");
  assert.ok(licenses.includes("Runtime dependencies"), "THIRD_PARTY_LICENSES.md must list runtime dependencies");
  for (const dep of deps) {
    assert.ok(
      licenses.includes(`\`${dep}\``),
      `THIRD_PARTY_LICENSES.md must document runtime dependency ${dep}`
    );
  }
});

