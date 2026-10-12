# Contributing to open-compute-mcp / Mitwirken an open-compute-mcp

[English](#english) | [Deutsch](#deutsch)

---

<a id="english"></a>
## English

Thanks for contributing to `open-compute-mcp`, the Node.js launcher for the separate Python [open-compute](https://github.com/ellmos-ai/open-compute) MCP server. The launcher forwards local stdio and starts a child process; it does not sandbox that child or change its permissions.

### Development

Work in a local clone of this repository. Node.js 18 or newer is required.

```sh
git clone https://github.com/ellmos-ai/open-compute-mcp.git
cd open-compute-mcp
npm ci
npm test
npm pack --dry-run
git diff --check
```

The default launcher separately fetches the Python project from GitHub via `uvx`. Tests for this npm repository do not start a live desktop session or certify the Python server, MCP client, or network isolation.

### Change and release scope

The source manifests currently declare `0.1.0-alpha.20`. Keep their versions aligned and do not create a release or change a version as part of routine maintenance. Record unreleased changes in `CHANGELOG.md` and retain historical release notes as dated records.

CI runs the repository's Node.js tests and npm packaging dry-run on the operating systems and Node versions listed in `.github/workflows/ci.yml`. This workflow is a project check, not branch protection or a guarantee that every environment has been tested.

### Legal note

The project is provided under the MIT license. Whether statutory rules such as section 521 BGB apply depends on the legal relationship and applicable law; this documentation does not provide a blanket exemption from liability.

### Security reports

Please report vulnerabilities privately through the GitHub security advisory page or the contacts listed in [SECURITY.md](SECURITY.md). The response targets in that policy are maintainer commitments, not runtime behavior.

---

<a id="deutsch"></a>
## Deutsch

Danke für Beiträge zu `open-compute-mcp`, dem Node.js-Launcher für den separaten Python-[open-compute](https://github.com/ellmos-ai/open-compute)-MCP-Server. Der Launcher leitet lokales stdio weiter und startet einen Kindprozess; er isoliert diesen Prozess nicht und ändert seine Berechtigungen nicht.

### Entwicklung

Arbeite in einem lokalen Klon dieses Repositorys. Erforderlich ist Node.js 18 oder neuer.

```sh
git clone https://github.com/ellmos-ai/open-compute-mcp.git
cd open-compute-mcp
npm ci
npm test
npm pack --dry-run
git diff --check
```

Der Standardstart des Launchers lädt das Python-Projekt separat mit `uvx` von GitHub. Tests für dieses npm-Repository starten keine Live-Desktop-Sitzung und zertifizieren weder Python-Server und MCP-Client noch eine Netzwerktrennung.

### Umfang von Änderungen und Releases

Die Quellmanifeste nennen derzeit `0.1.0-alpha.20`. Halte ihre Versionen synchron und erstelle bei normaler Wartung kein Release und ändere keine Version. Nicht veröffentlichte Änderungen gehören in `CHANGELOG.md`; historische Versionsnotizen bleiben datierte Aufzeichnungen.

CI führt die Node.js-Tests dieses Repositorys und einen npm-Paketierungsvorlauf auf den Betriebssystemen und Node-Versionen aus, die in `.github/workflows/ci.yml` aufgeführt sind. Dieser Workflow ist eine Projektprüfung, kein Branch-Schutz und keine Garantie, dass jede Umgebung getestet wurde.

### Rechtlicher Hinweis

Das Projekt steht unter der MIT-Lizenz. Ob gesetzliche Vorschriften wie § 521 BGB anwendbar sind, hängt vom konkreten Rechtsverhältnis und dem anwendbaren Recht ab; diese Dokumentation begründet keine pauschale Haftungsfreistellung.

### Sicherheitsmeldungen

Bitte melde Sicherheitslücken vertraulich über die GitHub-Sicherheitsmeldungen oder die Kontakte in [SECURITY.md](SECURITY.md). Die dort genannten Reaktionsziele sind Zusagen der Maintainer, keine Laufzeiteigenschaften.
