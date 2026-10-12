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

function headingSlug(heading) {
  return heading
    .replace(/<[^>]*>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/g, "-");
}

function validateLocalMarkdownLinks(file) {
  const contents = readText(file).replace(/```[\s\S]*?```/g, "");
  const links = [
    ...contents.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+(?:"[^"]*"|'[^']*'))?\)/g),
    ...contents.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),
  ];

  for (const match of links) {
    const link = match[1];
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(link)) continue;

    const [rawTarget, rawFragment] = link.split("#", 2);
    const relativeTarget = decodeURIComponent(rawTarget || path.basename(file));
    const target = path.resolve(root, path.dirname(file), relativeTarget);
    assert.ok(fs.existsSync(target), `${file} links to missing target ${link}`);

    if (rawFragment) {
      const fragment = decodeURIComponent(rawFragment);
      const targetText = fs.readFileSync(target, "utf8");
      const ids = new Set(
        [...targetText.matchAll(/\b(?:id|name)=["']([^"']+)["']/gi)].map((item) => item[1])
      );
      for (const heading of targetText.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
        ids.add(headingSlug(heading[1]));
      }
      assert.ok(ids.has(fragment), `${file} links to missing fragment ${link}`);
    }
  }
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
    "docs/archive/",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "SECURITY.md",
    "THIRD_PARTY_LICENSES.md",
    "NOTICE",
    "LICENSE",
    "server.json",
    "glama.json",
    "smithery.yaml",
    "llms.txt",
    "MARKETING-LOG.txt",
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
    "docs/archive/README-2026-10-12.md",
    "docs/archive/README_de-2026-10-12.md",
    "CONTRIBUTING.md",
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
  assert.match(llms, /## Install/, "llms.txt must describe installation");
  assert.match(llms, /## Process and network scope/, "llms.txt must describe process scope");
  assert.match(llms, /## Tool inventory/, "llms.txt must identify its tool inventory");
  assert.match(llms, /## Project files/, "llms.txt must link the project documentation");
});

test("glama.json metadata shape", () => {
  const glama = readJson("glama.json");
  assert.equal(typeof glama.name, "string");
  assert.equal(typeof glama.version, "string");
  assert.equal(typeof glama.description, "string");
  assert.ok(Number.isInteger(glama.tools.count) && glama.tools.count > 0);
  assert.ok(Array.isArray(glama.keywords));
  assert.ok(Array.isArray(glama.features));
});

test("bilingual security policy presence and contact integrity", () => {
  const sec = readText("SECURITY.md");
  assert.match(sec, /# Security Policy \/ Sicherheitsrichtlinie/, "SECURITY.md must have bilingual header");
  assert.match(sec, /## English/, "SECURITY.md must contain English section");
  assert.match(sec, /## Deutsch/, "SECURITY.md must contain German section");
  assert.match(sec, /security@open-bricks\.org/, "SECURITY.md must contain security@open-bricks.org");
  assert.match(sec, /security@ellmos\.ai/, "SECURITY.md must contain security@ellmos.ai");
  assert.match(sec, /support@lukasgeiger\.com/, "SECURITY.md must contain support@lukasgeiger.com");
  assert.match(sec, /### Reporting a vulnerability/);
  assert.match(sec, /### Sicherheitslücke melden/);
});

function validateMermaidBlocks(content, filename) {
  const blocks = [...content.matchAll(/```mermaid\s*\n([\s\S]*?)\n```/g)];
  assert.ok(blocks.length > 0, `${filename} must contain at least one mermaid block`);

  for (let bIndex = 0; bIndex < blocks.length; bIndex++) {
    const block = blocks[bIndex][1];
    const lines = block.split("\n");
    const isSequence = block.includes("sequenceDiagram");
    let blockDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("%%")) continue;

      if (isSequence) {
        if (/^(alt|opt|loop|par|critical|rect)\b/.test(line)) blockDepth++;
        if (/^end\b/.test(line)) blockDepth--;

        const msgMatch = line.match(/->>?[^:]*:\s*(.*)/);
        if (msgMatch) {
          const msg = msgMatch[1].replace(/&[a-zA-Z0-9#]+;/g, "");
          assert.ok(
            !msg.includes(";"),
            `${filename} block ${bIndex + 1} line ${i + 1}: unescaped semicolon in sequence diagram message will terminate statement and break GitHub rendering: "${line}"`
          );
        }
      } else {
        if (/^subgraph\b/.test(line)) blockDepth++;
        if (/^end\b/.test(line)) blockDepth--;

        const nodeMatch = line.match(/\b\w+\s*\[([^"\[\]\r\n]+)\]/);
        if (nodeMatch) {
          const inner = nodeMatch[1].trim();
          if (!inner.startsWith("(") && (inner.includes("(") || inner.includes(")"))) {
            assert.fail(
              `${filename} block ${bIndex + 1} line ${i + 1}: unquoted parenthesis in node label breaks GitHub rendering: "${line}"`
            );
          }
        }
      }
    }
    assert.equal(
      blockDepth,
      0,
      `${filename} block ${bIndex + 1}: unbalanced block statements (depth: ${blockDepth})`
    );
  }
}

test("Mermaid diagrams in the corrected detailed guides are structurally balanced", () => {
  const enGuide = readText("docs/archive/README-2026-10-12.md");
  const deGuide = readText("docs/archive/README_de-2026-10-12.md");

  assert.match(enGuide, /```mermaid[\s\S]*?sequenceDiagram/);
  assert.match(deGuide, /```mermaid[\s\S]*?sequenceDiagram/);
  validateMermaidBlocks(enGuide, "docs/archive/README-2026-10-12.md");
  validateMermaidBlocks(deGuide, "docs/archive/README_de-2026-10-12.md");
});

test("short README entrypoints link to their detailed language guides", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  assert.match(enReadme, /docs\/archive\/README-2026-10-12\.md/);
  assert.match(deReadme, /docs\/archive\/README_de-2026-10-12\.md/);
});

test("relative links and local assets resolve across published documentation", () => {
  for (const file of [
    "README.md",
    "README_de.md",
    "llms.txt",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "THIRD_PARTY_LICENSES.md",
    "docs/archive/README-2026-10-12.md",
    "docs/archive/README_de-2026-10-12.md",
  ]) {
    validateLocalMarkdownLinks(file);
  }
});

test("GitHub Actions CI workflow schema, concurrency, and matrix integrity", () => {
  const ciPath = path.join(root, ".github", "workflows", "ci.yml");
  assert.ok(fs.existsSync(ciPath), ".github/workflows/ci.yml must exist");
  const ciContent = fs.readFileSync(ciPath, "utf8");
  assert.match(ciContent, /name:\s*CI/, "CI workflow must be named CI");
  assert.match(ciContent, /cancel-in-progress:\s*true/, "CI workflow must configure cancel-in-progress concurrency");
  assert.match(ciContent, /permissions:\s*\n\s*contents:\s*read/, "CI workflow must define least-privilege contents: read permission");
  assert.match(ciContent, /timeout-minutes:\s*15/, "CI workflow must configure 15-minute job timeout");
  assert.match(ciContent, /ubuntu-latest/, "CI matrix must include ubuntu-latest");
  assert.match(ciContent, /windows-latest/, "CI matrix must include windows-latest");
  assert.match(ciContent, /macos-latest/, "CI matrix must include macos-latest");
  assert.match(ciContent, /18\.x/, "CI matrix must include Node 18.x");
  assert.match(ciContent, /24\.x/, "CI matrix must include Node 24.x");
  assert.match(ciContent, /npm test/, "CI steps must run npm test");
  assert.match(ciContent, /npm pack --dry-run/, "CI steps must verify packaging with npm pack --dry-run");
});

test("package.json repository and ecosystem urls integrity", () => {
  const pkg = readJson("package.json");
  assert.equal(pkg.repository.url, "git+https://github.com/ellmos-ai/open-compute-mcp.git");
  assert.equal(pkg.homepage, "https://github.com/ellmos-ai/open-compute-mcp#readme");
  assert.equal(pkg.bugs.url, "https://github.com/ellmos-ai/open-compute-mcp/issues");
  assert.ok(pkg.engines && pkg.engines.node, "package.json must define engines.node");
});

test("third party licenses inventory documentation integrity", () => {
  const licenses = readText("THIRD_PARTY_LICENSES.md");
  assert.match(licenses, /# Third-party license information/, "THIRD_PARTY_LICENSES.md must have title");
  assert.match(licenses, /Reviewed:\s*\d{4}-\d{2}-\d{2}/, "THIRD_PARTY_LICENSES.md must have a review date");
  assert.match(licenses, /update-notifier/, "THIRD_PARTY_LICENSES.md must list update-notifier");
  assert.match(licenses, /BSD-2-Clause/, "THIRD_PARTY_LICENSES.md must list BSD-2-Clause license");
});

test("package version and manifest parity across package.json, server.json, and glama.json", () => {
  const pkg = readJson("package.json");
  const server = readJson("server.json");
  const glama = readJson("glama.json");

  assert.equal(pkg.version, "0.1.0-alpha.20", "package.json version must be 0.1.0-alpha.20");
  assert.equal(server.version, "0.1.0-alpha.20", "server.json version must be 0.1.0-alpha.20");
  assert.equal(glama.version, "0.1.0-alpha.20", "glama.json version must be 0.1.0-alpha.20");
  assert.ok(server.packages && server.packages[0], "server.json packages array must exist");
  assert.equal(server.packages[0].version, "0.1.0-alpha.20", "server.json package entry must be 0.1.0-alpha.20");
});

test("GitHub Actions lifecycle workflows stale.yml and welcome.yml define bounds and timeouts", () => {
  const stalePath = path.join(root, ".github", "workflows", "stale.yml");
  const welcomePath = path.join(root, ".github", "workflows", "welcome.yml");

  assert.ok(fs.existsSync(stalePath), ".github/workflows/stale.yml must exist");
  assert.ok(fs.existsSync(welcomePath), ".github/workflows/welcome.yml must exist");

  const staleContent = fs.readFileSync(stalePath, "utf8");
  const welcomeContent = fs.readFileSync(welcomePath, "utf8");

  assert.match(staleContent, /timeout-minutes:\s*10/, "stale.yml must enforce 10-minute job timeout");
  assert.match(staleContent, /cancel-in-progress:\s*true/, "stale.yml must enforce cancel-in-progress concurrency");
  assert.match(staleContent, /permissions:\s*\n\s*issues:\s*write\s*\n\s*pull-requests:\s*write/, "stale.yml must declare issues and pull-requests permissions");

  assert.match(welcomeContent, /timeout-minutes:\s*5/, "welcome.yml must enforce 5-minute job timeout");
  assert.match(welcomeContent, /cancel-in-progress:\s*true/, "welcome.yml must enforce cancel-in-progress concurrency");
  assert.match(welcomeContent, /permissions:\s*\n\s*issues:\s*write\s*\n\s*pull-requests:\s*write/, "welcome.yml must declare issues and pull-requests permissions");
});

test("NOTICE attribution file integrity and open-bricks umbrella linkage", () => {
  const noticePath = path.join(root, "NOTICE");
  assert.ok(fs.existsSync(noticePath), "NOTICE file must exist");
  const content = fs.readFileSync(noticePath, "utf8");
  assert.match(content, /^open-compute-mcp/, "NOTICE must mention open-compute-mcp");
  assert.match(content, /open-bricks open-source umbrella/, "NOTICE must reference open-bricks open-source umbrella");
  assert.match(content, /THIRD_PARTY_LICENSES\.md/, "NOTICE must reference THIRD_PARTY_LICENSES.md");
  assert.match(content, /THIRD_PARTY_LICENSES\.txt/, "NOTICE must reference THIRD_PARTY_LICENSES.txt");
});

test("corrected archives retain all legacy section anchors", () => {
  const enReadme = readText("docs/archive/README-2026-10-12.md");
  const deReadme = readText("docs/archive/README_de-2026-10-12.md");

  for (let i = 1; i <= 18; i++) {
    const secTag = `<a id="sec-${String(i).padStart(2, "0")}"></a>`;
    assert.ok(enReadme.includes(secTag), `English archive must include anchor ${secTag}`);
    assert.ok(deReadme.includes(secTag), `German archive must include anchor ${secTag}`);
  }
});

test("plain-text dependency inventory lists the direct runtime dependency", () => {
  const txtContent = readText("THIRD_PARTY_LICENSES.txt");
  assert.match(txtContent, /SELECTED THIRD-PARTY LICENSE INFORMATION/);
  assert.match(txtContent, /Declared direct runtime dependency/i);
  assert.match(txtContent, /Package:\s*update-notifier/);
  assert.match(txtContent, /Declared license:\s*BSD-2-Clause/);
});

test("contributing guide provides bilingual sections and runnable checks", () => {
  const contributing = readText("CONTRIBUTING.md");
  assert.match(contributing, /# Contributing to open-compute-mcp \/ Mitwirken an open-compute-mcp/);
  assert.match(contributing, /## English/);
  assert.match(contributing, /## Deutsch/);
  assert.match(contributing, /npm test/);
  assert.match(contributing, /npm pack --dry-run/);
  assert.match(contributing, /git diff --check/);
});

test("dependabot workflow guard and changelog unreleased entry integrity", () => {
  const changelog = readText("CHANGELOG.md");
  assert.match(changelog, /## \[Unreleased\]/, "CHANGELOG.md must contain ## [Unreleased]");
  assert.match(changelog, /T-20260920-167562623/, "CHANGELOG.md must reference version freeze ticket");
});

