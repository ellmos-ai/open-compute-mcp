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

function isIgnored(samplePath) {
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
  ]) {
    assert.equal(isIgnored(samplePath), true, `${samplePath} should be ignored`);
  }

  assert.equal(isIgnored(".env.example"), false, ".env.example should stay trackable");
  assert.equal(isIgnored(".env.sample"), false, ".env.sample should stay trackable");
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
