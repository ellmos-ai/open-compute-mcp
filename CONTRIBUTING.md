# Contributing to open-compute-mcp / Mitwirken an open-compute-mcp

[English](#english) | [Deutsch](#deutsch)

---

<a id="english"></a>
## English

Thank you for your interest in contributing to **open-compute-mcp** (`ellmos-ai/open-compute-mcp`), the local-first, model-agnostic Model Context Protocol (MCP) launcher providing secure computer-use capabilities (screenshot capture, Windows UI Automation element targeting, safety-gated actions, leased visual signal overlay, and push-to-talk voice/chat) over standard input/output (`stdio`) JSON-RPC.

### 1. Architectural Principles & 10 Governance Invariants

All contributions must strictly adhere to our core architectural and runtime invariants:

1. **Zero-Egress & Local Stdio (`INV-LOCAL-01`)**: The launcher executes purely over standard input/output (`stdio`) JSON-RPC. It never transmits screenshots, telemetry, or user data to external networks. Not remotely hostable.
2. **Fail-Closed Safety Ceiling (`INV-GATE-02`)**: `OC_SAFETY_MODE` (default: `confirm`, options: `read_only`, `allow_all`) acts as a strict operator ceiling. Per-call parameters can only tighten safety rules, never loosen them.
3. **One-Shot Observation Lifespan (`INV-OBS-03`)**: Ephemeral observation IDs (`observation_id`) are single-use tokens invalidated after exactly one action to prevent stale-frame hallucination.
4. **Strict Window Binding (`INV-WIN-04`)**: Desktop input and targeting require issued window descriptors and tokens, preventing accidental clicks on background or out-of-focus windows.
5. **Leased Signal Overlay & Immediate Abort (`INV-SIG-05`)**: Visual countdown overlay (`signal_show`) features session leases, bounded TTL cleanup, and emergency hotkey abort (`signal_abort`) returning immediate feedback to the reasoner.
6. **Exact-First Semantic Resolution (`INV-UIA-06`)**: Windows UI Automation (UIA) targeting prioritizes exact element matches before resorting to heuristic or fuzzy resolution (`click_name`, `invoke`).
7. **Unprivileged RunAsInvoker Mode (`INV-PROC-07`)**: Operates entirely with standard user privileges (`RunAsInvoker`). Zero administrative elevation (UAC admin or root/sudo) is permitted or required.
8. **Multi-OS Stdio Protocol Parity (`INV-CROSS-08`)**: Node.js launcher parity is validated across Windows, Linux, and macOS platforms on Node.js 18.x through 24.x (real desktop capture/input requires an interactive Windows desktop session).
9. **Multi-Agent Lock & Conflict Discipline (`INV-SYNC-09`)**: Multi-host cloud synchronization and agent coordination follow fail-closed lock and gitignore hygiene, protecting credentials, tokens, and conflict copies.
10. **Binding 30d Remediation SLA (`INV-SLA-10`)**: Binding 48-hour response confirmation, 5 business days triage assessment, and 30 calendar days remediation SLA for confirmed security vulnerabilities.

### 2. Plan D Local Development Workflow

In accordance with our repository architecture (Plan D), the canonical local git repository serves as the authoritative **Source of Truth** (`C:\_Local_DEV\repos\open-compute-mcp`). Development, testing, and commits must take place exclusively in the local clone.

```bash
# Clone the canonical repository
git clone https://github.com/ellmos-ai/open-compute-mcp.git
cd open-compute-mcp

# Install dependencies
npm install

# Run automated test suite
npm test

# Verify npm packaging dry-run
npm pack --dry-run
```

### 3. Version Freeze Discipline (`T-20260920-167562623`)

`open-compute-mcp` operates under strict version-freeze discipline. Version `0.1.0-alpha.20` in `package.json`, `package-lock.json`, `server.json`, `glama.json`, and documentation badges must not be incremented during maintenance or hygiene runs without explicit release authorization. All technical hygiene, documentation updates, and workflow additions are documented under `## [Unreleased]` in `CHANGELOG.md`.

### 4. Quality Gates

Before submitting a pull request, verify that all quality gates pass:
1. `npm test`: 100% green test execution across all unit, integration, and metadata contract suites.
2. `npm pack --dry-run`: Zero missing assets or packaging warnings; all canonical distribution files properly included.
3. `git diff --check`: Zero whitespace anomalies.
4. `git diff -G"version"`: Zero unauthorized version modifications.

### 5. Statutory Notice (§ 521 BGB) & Liability Disclaimer

This software is provided free of charge as open-source software under the MIT License. In accordance with statutory German law (§ 521 BGB - Gefälligkeitsrecht), liability for defects in quality and title is strictly limited to intentional misconduct (*Vorsatz*) and gross negligence (*grobe Fahrlässigkeit*).

### 6. Security Contact & Vulnerability Reporting

Please report security issues privately:
- Umbrella Security Team: [security@open-bricks.org](mailto:security@open-bricks.org)
- Security Contact: [security@ellmos.ai](mailto:security@ellmos.ai)
- Maintainer: [lukas@open-bricks.org](mailto:lukas@open-bricks.org)
- Maintainer: [lukas@ellmos.ai](mailto:lukas@ellmos.ai)
- Maintainer: [support@lukasgeiger.com](mailto:support@lukasgeiger.com)
- Adhere to the 48h Security Response SLA (`INV-SLA-10`) as detailed in [SECURITY.md](SECURITY.md).

---

<a id="deutsch"></a>
## Deutsch

Vielen Dank für dein Interesse an einer Mitwirkung bei **open-compute-mcp** (`ellmos-ai/open-compute-mcp`), dem lokalen, modellagnostischen Model Context Protocol (MCP) Launcher für sichere Computer-Use-Fähigkeiten (Screenshot-Erfassung, Windows UI Automation Element-Targeting, sicherheitsüberwachte Aktionen, visuelles Signal-Overlay und Push-to-Talk Sprach-/Chat-Notizen) über Standard-Input/Output (`stdio`) JSON-RPC.

### 1. Architektur-Prinzipien & 10 Governance-Invarianten

Alle Beiträge müssen unsere verbindlichen Kern-Invarianten strikt einhalten:

1. **Zero-Egress & Lokales Stdio (`INV-LOCAL-01`)**: Der Launcher arbeitet ausschließlich über Standard-Input/Output (`stdio`) JSON-RPC. Es werden keinerlei Screenshots, Telemetriedaten oder Benutzerdaten an externe Netzwerke übertragen. Nicht remote hostbar.
2. **Fehlgeschlossene Sicherheits-Obergrenze (`INV-GATE-02`)**: `OC_SAFETY_MODE` (Standard: `confirm`, Optionen: `read_only`, `allow_all`) fungiert als strikte Operator-Obergrenze. Aufrufparameter können Sicherheitsregeln nur verschärfen, niemals lockern.
3. **Einmalige Beobachtungs-Lebensdauer (`INV-OBS-03`)**: Flüchtige Beobachtungs-IDs (`observation_id`) sind Einmal-Tokens, die nach genau einer Aktion entwertet werden, um Halluzinationen durch veraltete Bildschirmstände zu verhindern.
4. **Strikte Fensterbindung (`INV-WIN-04`)**: Desktop-Eingaben und Zielerfassungen erfordern ausgestellte Fenster-Deskriptoren und Tokens, was versehentliche Klicks auf Hintergrundfenster ausschließt.
5. **Geleastes Signal-Overlay & Sofort-Abbruch (`INV-SIG-05`)**: Das visuelle Countdown-Overlay (`signal_show`) besitzt Session-Leases, begrenzte TTL-Bereinigung und einen Notfall-Hotkey-Abbruch (`signal_abort`) mit sofortiger Rückmeldung an das reasoning-Modell.
6. **Exakte semantische Auflösung zuerst (`INV-UIA-06`)**: Windows UI Automation (UIA) Element-Targeting priorisiert exakte Namensübereinstimmungen vor heuristischen oder unscharfen Treffern (`click_name`, `invoke`).
7. **Rechtefreier Benutzermodus (`INV-PROC-07`)**: Reine `RunAsInvoker`-Ausführung im Standardbenutzermodus. Administrative Rechte (UAC-Admin oder root/sudo) sind weder erforderlich noch gestattet.
8. **Plattformübergreifende Stdio-Protokoll-Parität (`INV-CROSS-08`)**: Die Protokoll-Parität des Node.js-Launchers ist über Windows, Linux und macOS auf Node.js 18.x bis 24.x verifiziert (reale Desktop-Erfassung/-Steuerung erfordert eine interaktive Windows-Desktop-Sitzung).
9. **Multi-Agent Lock- & Konflikt-Disziplin (`INV-SYNC-09`)**: Multi-Host Cloud-Synchronisation und Agenten-Koordination folgen einer fehlgeschlossenen Lock- und Gitignore-Hygiene zum Schutz vor Daten-, Token- und Konfliktkopie-Lecks.
10. **Verbindliche 30-Tage Behebungszusage (`INV-SLA-10`)**: Verbindliche 48-Stunden-Erstantwort, 5-Werktage-Triage und 30-Kalendertage-Behebungszusage für bestätigte Sicherheitsmeldungen.

### 2. Plan D Lokaler Entwicklungsworkflow

Gemäß unserer Repository-Architektur (Plan D) bildet das lokale Git-Repository die alleinige maßgebliche **Source of Truth** (`C:\_Local_DEV\repos\open-compute-mcp`). Entwicklung, Tests und Commits finden ausschließlich im kanonischen lokalen Klon statt.

```bash
# Kanonischen Klon verwenden
git clone https://github.com/ellmos-ai/open-compute-mcp.git
cd open-compute-mcp

# Abhängigkeiten installieren
npm install

# Testsuite ausführen
npm test

# Paketierungsvorschau prüfen
npm pack --dry-run
```

### 3. Version-Freeze-Disziplin (`T-20260920-167562623`)

`open-compute-mcp` unterliegt einer strikten Version-Freeze-Disziplin. Version `0.1.0-alpha.20` in `package.json`, `package-lock.json`, `server.json`, `glama.json` und Dokumentations-Badges darf während Wartungs- und Hygiene-Läufen ohne ausdrückliche Freigabe nicht erhöht werden. Alle technischen Wartungen, Dokumentationsanpassungen und Workflows werden unter `## [Unreleased]` in `CHANGELOG.md` erfasst.

### 4. Qualitätstore

Vor jedem Pull Request müssen alle Qualitätstore erfolgreich durchlaufen werden:
1. `npm test`: 100% grüne Ausführung über alle Unit-, Integrations- und Vertragstests.
2. `npm pack --dry-run`: Keine fehlenden Dateien oder Warnungen; alle Distributionsdateien sauber enthalten.
3. `git diff --check`: Keine Whitespace-Fehler.
4. `git diff -G"version"`: Keine unbefugten Versionsänderungen.

### 5. Gesetzlicher Hinweis (§ 521 BGB) & Haftungsausschluss

Diese Software wird unentgeltlich als Open-Source-Software unter der MIT-Lizenz bereitgestellt. Gemäß § 521 BGB (Gefälligkeitsrecht) ist die Haftung für Sach- und Rechtsmängel auf Vorsatz und grobe Fahrlässigkeit beschränkt.

### 6. Sicherheitskontakt & Meldung von Schwachstellen

Sicherheitsrelevante Hinweise bitte vertraulich einreichen an:
- Dachorganisation Sicherheitsteam: [security@open-bricks.org](mailto:security@open-bricks.org)
- Sicherheitskontakt: [security@ellmos.ai](mailto:security@ellmos.ai)
- Maintainer: [lukas@open-bricks.org](mailto:lukas@open-bricks.org)
- Maintainer: [lukas@ellmos.ai](mailto:lukas@ellmos.ai)
- Maintainer: [support@lukasgeiger.com](mailto:support@lukasgeiger.com)
- Einhaltung der verbindlichen 48h-Reaktions-SLA (`INV-SLA-10`) gemäß [SECURITY.md](SECURITY.md).
