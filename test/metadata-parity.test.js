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
  assert.match(llms, /## Last-checked:\s*2026-09-13/, "llms.txt must have 2026-09-13 last-checked timestamp");
  assert.match(llms, /## Tools\s*\(16\)/, "llms.txt must document 16 tools");
  assert.match(llms, /## Safety/, "llms.txt must document safety modes");
  assert.match(llms, /- signal_show:/, "llms.txt must document signal_show tool");
  assert.match(llms, /- signal_abort:/, "llms.txt must document signal_abort tool");
  assert.match(llms, /- talk:/, "llms.txt must document talk tool");
});

test("glama.json tools count and features consistency", () => {
  const glama = readJson("glama.json");
  assert.equal(glama.tools.count, 16, "glama.json tool count must be 16");
  assert.match(glama.description, /interactive Windows desktop session/i);
  assert.match(glama.description, /not Glama-hostable/i);
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
  assert.match(sec, /security@open-bricks\.org/, "SECURITY.md must contain security@open-bricks.org");
  assert.match(sec, /security@ellmos\.ai/, "SECURITY.md must contain security@ellmos.ai");
  assert.match(sec, /support@lukasgeiger\.com/, "SECURITY.md must contain support@lukasgeiger.com");
  assert.match(sec, /48 hours|48 Stunden/, "SECURITY.md must specify 48h response SLA");
  assert.match(sec, /5 business days|5 Werktagen/, "SECURITY.md must specify 5-day triage commitment");
  assert.match(sec, /Supported Versions|Unterstützte Versionen/, "SECURITY.md must contain supported versions matrix");
  assert.match(sec, /OC_SAFETY_MODE/, "SECURITY.md must explain OC_SAFETY_MODE");
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

test("mermaid lifecycle sequence diagrams in both README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  assert.match(enReadme, /```mermaid[\s\S]*?sequenceDiagram/, "README.md must have sequence diagram");
  assert.match(deReadme, /```mermaid[\s\S]*?sequenceDiagram/, "README_de.md must have sequence diagram");
  assert.match(enReadme, /Safe Interaction & Signal Lifecycle/, "README.md must have signal lifecycle heading");
  assert.match(deReadme, /Sichere Interaktion & Signal-Lebenszyklus/, "README_de.md must have German signal lifecycle heading");

  validateMermaidBlocks(enReadme, "README.md");
  validateMermaidBlocks(deReadme, "README_de.md");
});

test("badges and quick navigation parity across README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  assert.match(enReadme, /Quick Navigation/, "README.md must include Quick Navigation");
  assert.match(deReadme, /Schnellnavigation/, "README_de.md must include Schnellnavigation");
  assert.match(enReadme, /tests-35%20passed-brightgreen\.svg/, "README.md must link 35 passed tests badge");
  assert.match(deReadme, /tests-35%20passed-brightgreen\.svg/, "README_de.md must link 35 passed tests badge");
  assert.match(enReadme, /actions\/workflows\/ci\.yml\/badge\.svg/, "README.md must link dynamic CI workflow badge");
  assert.match(deReadme, /actions\/workflows\/ci\.yml\/badge\.svg/, "README_de.md must link dynamic CI workflow badge");
  assert.doesNotMatch(enReadme, /glama\.ai\/mcp\/servers\/ellmos-ai\/open-compute-mcp\/badges\/score\.svg/, "README.md must not promote an incompatible hosted listing");
  assert.doesNotMatch(deReadme, /glama\.ai\/mcp\/servers\/ellmos-ai\/open-compute-mcp\/badges\/score\.svg/, "README_de.md must not promote an incompatible hosted listing");
  assert.match(enReadme, /not Glama-hostable/);
  assert.match(deReadme, /nicht bei Glama hostbar/);
  assert.doesNotMatch(enReadme, /open-compute-mcp\/badge["']/, "README.md must not include static Glama banner card");
  assert.doesNotMatch(deReadme, /open-compute-mcp\/badge["']/, "README_de.md must not include static Glama banner card");
  assert.doesNotMatch(enReadme, /glama-badge\.jpg/, "README.md must not reference static glama-badge.jpg");
  assert.doesNotMatch(deReadme, /glama-badge\.jpg/, "README_de.md must not reference static glama-badge.jpg");
  assert.match(enReadme, /Zero--Egress/, "README.md must include Zero-Egress badge");
  assert.match(deReadme, /Zero--Egress/, "README_de.md must include Zero-Egress badge");
  assert.match(enReadme, /third--party-audited%20%7C%20100%25%20permissive-brightgreen\.svg/, "README.md must link third-party audit badge");
  assert.match(deReadme, /third--party-audited%20%7C%20100%25%20permissive-brightgreen\.svg/, "README_de.md must link third-party audit badge");
  assert.match(enReadme, /marketing--log-active-blue\.svg/, "README.md must link marketing log badge");
  assert.match(deReadme, /marketing--log-active-blue\.svg/, "README_de.md must link marketing log badge");
  assert.match(enReadme, /verified-2026--09--13-blue\.svg/, "README.md must link verified timestamp badge");
  assert.match(deReadme, /verified-2026--09--13-blue\.svg/, "README_de.md must link verified timestamp badge");
});

test("umbrella ecosystem badge parity in README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");
  assert.match(enReadme, /umbrella-open--bricks-indigo\.svg/, "README.md must link open-bricks umbrella badge");
  assert.match(deReadme, /umbrella-open--bricks-indigo\.svg/, "README_de.md must link open-bricks umbrella badge");
  assert.match(enReadme, /ecosystem-ellmos--ai-blueviolet\.svg/, "README.md must link ellmos-ai ecosystem badge");
  assert.match(deReadme, /ecosystem-ellmos--ai-blueviolet\.svg/, "README_de.md must link ellmos-ai ecosystem badge");
});

test("GitHub Actions CI workflow schema, concurrency, and matrix integrity", () => {
  const ciPath = path.join(root, ".github", "workflows", "ci.yml");
  assert.ok(fs.existsSync(ciPath), ".github/workflows/ci.yml must exist");
  const ciContent = fs.readFileSync(ciPath, "utf8");
  assert.match(ciContent, /name:\s*CI/, "CI workflow must be named CI");
  assert.match(ciContent, /cancel-in-progress:\s*true/, "CI workflow must configure cancel-in-progress concurrency");
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
  assert.match(licenses, /# Third-Party License Review/, "THIRD_PARTY_LICENSES.md must have title");
  assert.match(licenses, /Stand:\s*2026-09-13/, "THIRD_PARTY_LICENSES.md must have current review date");
  assert.match(licenses, /update-notifier/, "THIRD_PARTY_LICENSES.md must list update-notifier");
  assert.match(licenses, /BSD-2-Clause/, "THIRD_PARTY_LICENSES.md must list BSD-2-Clause license");
});

test("governance and runtime invariants presence across documentation", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");
  const llms = readText("llms.txt");

  const invariants = [
    "INV-LOCAL-01",
    "INV-GATE-02",
    "INV-OBS-03",
    "INV-WIN-04",
    "INV-SIG-05",
    "INV-UIA-06",
    "INV-PROC-07",
    "INV-CROSS-08",
    "INV-SYNC-09",
    "INV-SLA-10",
  ];

  for (const inv of invariants) {
    assert.ok(enReadme.includes(inv), `README.md must document ${inv}`);
    assert.ok(deReadme.includes(inv), `README_de.md must document ${inv}`);
    assert.ok(llms.includes(inv), `llms.txt must document ${inv}`);
  }
});

test("16-point quick navigation anchor parity across README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  const expectedEnNav = [
    "#key-capabilities",
    "#architecture",
    "#tools",
    "#use-with-an-mcp-client",
    "#target-personas--discoverability",
    "#comparative-matrix-vs-alternatives",
    "#safe-interaction--signal-lifecycle",
    "#configuration-environment-variables",
    "#safety",
    "#governance--runtime-invariants",
    "#testing--verification",
    "SECURITY.md",
    "THIRD_PARTY_LICENSES.md",
    "MARKETING-LOG.txt",
    "llms.txt",
    "#ellmos-ai-ecosystem",
  ];

  const expectedDeNav = [
    "#hauptfunktionen",
    "#architektur",
    "#tools",
    "#nutzung-mit-einem-mcp-client",
    "#zielgruppen--auffindbarkeit",
    "#vergleichsmatrix-gegenueber-alternativen",
    "#sichere-interaktion--signal-lebenszyklus",
    "#konfiguration-umgebungsvariablen",
    "#sicherheit",
    "#governance--laufzeit-invarianten",
    "#tests--verifikation",
    "SECURITY.md",
    "THIRD_PARTY_LICENSES.md",
    "MARKETING-LOG.txt",
    "llms.txt",
    "#ellmos-ai-ökosystem",
  ];

  for (const target of expectedEnNav) {
    assert.ok(enReadme.includes(target), `README.md Quick Navigation must link ${target}`);
  }
  for (const target of expectedDeNav) {
    assert.ok(deReadme.includes(target), `README_de.md Schnellnavigation must link ${target}`);
  }
});

test("security sla and code style badges in README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  assert.match(enReadme, /code_style-prettier-brightgreen\.svg/, "README.md must link Prettier code style badge");
  assert.match(deReadme, /code_style-prettier-brightgreen\.svg/, "README_de.md must link Prettier code style badge");
  assert.match(enReadme, /security--sla-48h%20Response%20%7C%205d%20Triage-blue\.svg/, "README.md must link Security SLA badge");
  assert.match(deReadme, /security--sla-48h%20Response%20%7C%205d%20Triage-blue\.svg/, "README_de.md must link Security SLA badge");
});

test("target personas and high-intent search terms across README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  const enPersonas = [
    "Autonomous AI Agents & Swarms",
    "Enterprise AI Safety & SecOps Teams",
    "Windows GUI QA & Accessibility Engineers",
    "Multimodal Human-in-the-Loop Operators",
  ];
  const dePersonas = [
    "Autonome KI-Agenten & Schwärme",
    "Enterprise AI Safety & SecOps-Teams",
    "Windows GUI QA & Barrierefreiheits-Tester",
    "Multimodale Human-in-the-Loop Anwender",
  ];

  for (const p of enPersonas) {
    assert.ok(enReadme.includes(p), `README.md must describe persona: ${p}`);
  }
  for (const p of dePersonas) {
    assert.ok(deReadme.includes(p), `README_de.md must describe persona: ${p}`);
  }

  assert.match(enReadme, /### High-Intent Search Term Matrix \(SEO & Discoverability\)/);
  assert.match(deReadme, /### Hochrelevante Suchbegriffs-Matrix \(SEO & Discovery\)/);
});

test("10-dimension comparative matrix vs alternatives across README files", () => {
  const enReadme = readText("README.md");
  const deReadme = readText("README_de.md");

  const dimensions = [
    "1. Primary Interface & Transport",
    "2. Safety Ceiling & Guardrails",
    "3. State Binding & Observation Lifespan",
    "4. Dual Targeting Precision",
    "5. Visual Signal & Countdown",
    "6. Emergency Abort & Auto-Release",
    "7. Multimodal Feedback",
    "8. Token Economy Optimization",
    "9. Privacy & Zero-Egress",
    "10. Governance & Security SLA",
  ];

  for (const dim of dimensions) {
    assert.ok(enReadme.includes(dim), `README.md comparative matrix must cover: ${dim}`);
  }

  const deDimensions = [
    "1. Primäres Interface & Transport",
    "2. Sicherheitsleitplanken & Ceiling",
    "3. Zustandsbindung & Observation-Lebensdauer",
    "4. Duale Targeting-Präzision",
    "5. Visuelles Signal-Overlay & Countdown",
    "6. Notfall-Abbruch & Auto-Release",
    "7. Multimodales Feedback",
    "8. Token- & Vision-Optimierung",
    "9. Datenschutz & Zero-Egress",
    "10. Lizenz & Sicherheits-SLA",
  ];

  for (const dim of deDimensions) {
    assert.ok(deReadme.includes(dim), `README_de.md comparative matrix must cover: ${dim}`);
  }
});

test("package version and manifest parity across package.json, server.json, and glama.json", () => {
  const pkg = readJson("package.json");
  const server = readJson("server.json");
  const glama = readJson("glama.json");

  assert.equal(pkg.version, "0.1.0-alpha.19", "package.json version must be 0.1.0-alpha.19");
  assert.equal(server.version, "0.1.0-alpha.19", "server.json version must be 0.1.0-alpha.19");
  assert.equal(glama.version, "0.1.0-alpha.19", "glama.json version must be 0.1.0-alpha.19");
  assert.ok(server.packages && server.packages[0], "server.json packages array must exist");
  assert.equal(server.packages[0].version, "0.1.0-alpha.19", "server.json package entry must be 0.1.0-alpha.19");
  assert.match(pkg.description, /interactive Windows desktop session/i);
  assert.match(server.description, /interactive Windows desktop session/i);
  assert.equal(pkg.keywords.includes("glama"), false, "package search tags must not promote incompatible hosted integration");
  assert.match(readText("llms.txt"), /not Glama-hostable/);
});

test("marketing log recency and Pfad B entry presence", () => {
  const log = readText("MARKETING-LOG.txt");
  assert.match(log, /Audit Date:\s*2026-09-13/, "MARKETING-LOG.txt must have 2026-09-13 audit date");
  assert.match(log, /2026-09-13 \(Pfad B\):/, "MARKETING-LOG.txt must contain 2026-09-13 Pfad B entry");
  assert.match(log, /16-point quick navigation/, "MARKETING-LOG.txt must document 16-point quick navigation");
  assert.match(log, /Target Personas & Discoverability/, "MARKETING-LOG.txt must document personas");
  assert.match(log, /10-dimension Comparative Matrix/, "MARKETING-LOG.txt must document comparative matrix");
});

test("third-party licenses invariants and permissive compatibility section", () => {
  const lic = readText("THIRD_PARTY_LICENSES.md");
  assert.match(lic, /## Permissive License Compatibility & Invariants/);
  assert.match(lic, /Zero Copyleft/);
  assert.match(lic, /Local-First & Zero-Egress/);
  assert.match(lic, /Unprivileged Execution/);
  assert.match(lic, /RunAsInvoker/);
  assert.match(lic, /48h Security Response and 5-day Triage SLA/);
});
