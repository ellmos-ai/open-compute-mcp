# Security Policy / Sicherheitsrichtlinie

[English](#english) | [Deutsch](#deutsch)

---

<a name="english"></a>
## English

### Reporting a vulnerability

Please report security issues privately through GitHub [Private Vulnerability Reporting](https://github.com/ellmos-ai/open-compute-mcp/security/advisories) or by email:

- Umbrella security contact: [security@open-bricks.org](mailto:security@open-bricks.org)
- Security contact: [security@ellmos.ai](mailto:security@ellmos.ai)
- Maintainers: [lukas@open-bricks.org](mailto:lukas@open-bricks.org), [lukas@ellmos.ai](mailto:lukas@ellmos.ai), [support@lukasgeiger.com](mailto:support@lukasgeiger.com)

Maintainers aim to acknowledge reports within 48 hours, provide an initial triage within 5 business days, and deliver a fix or mitigation within 30 calendar days for confirmed vulnerabilities before public disclosure. These are maintainer response targets; they are not runtime guarantees or a certification.

### Supported versions

| Version | Support |
|---|---|
| 0.1.x | Active preview line |
| Earlier versions | No longer maintained |

### Scope and operational notes

`open-compute-mcp` is a Node.js launcher for the separate Python [open-compute](https://github.com/ellmos-ai/open-compute) server. It forwards the MCP stdio streams to a child process. This transport does not filter network access.

- Installing the npm package contacts npm. The default `uvx` launch fetches the Python project from GitHub, and the optional interactive update notice can check npm. The Python child and the MCP client may make their own network requests.
- The child inherits the launching process's environment and operating-system privileges. This package does not provide a sandbox, firewall, environment scrubber, or privilege drop.
- Action modes, deny lists, input targeting, and signal behavior belong to the Python server. Review its documentation and configure the MCP client's own tool approval controls. This launcher does not enforce those controls.
- Real screen capture and input require an interactive Windows desktop on the MCP client's host. Tool results, including screenshots, are returned through the MCP client; the client controls their downstream routing and storage.
- The Node.js wrapper tests do not certify live desktop behavior, provider behavior, or network isolation.

Treat screen content and other external input as untrusted. Review permissions and network access for the complete process tree and the MCP client you choose to run.

---

<a name="deutsch"></a>
## Deutsch

### Sicherheitslücke melden

Bitte melde Sicherheitsprobleme vertraulich über GitHub [Private Vulnerability Reporting](https://github.com/ellmos-ai/open-compute-mcp/security/advisories) oder per E-Mail:

- Sicherheitskontakt der Dachorganisation: [security@open-bricks.org](mailto:security@open-bricks.org)
- Sicherheitskontakt: [security@ellmos.ai](mailto:security@ellmos.ai)
- Maintainer: [lukas@open-bricks.org](mailto:lukas@open-bricks.org), [lukas@ellmos.ai](mailto:lukas@ellmos.ai), [support@lukasgeiger.com](mailto:support@lukasgeiger.com)

Die Maintainer bemühen sich, Meldungen innerhalb von 48 Stunden zu bestätigen, innerhalb von 5 Werktagen eine erste Triage vorzunehmen und bei bestätigten Sicherheitslücken vor einer öffentlichen Bekanntgabe innerhalb von 30 Kalendertagen eine Korrektur oder Schutzmaßnahme bereitzustellen. Das sind Reaktionsziele der Maintainer, keine Laufzeitgarantie oder Zertifizierung.

### Unterstützte Versionen

| Version | Unterstützung |
|---|---|
| 0.1.x | Aktive Vorabversionsreihe |
| Ältere Versionen | Werden nicht mehr gepflegt |

### Umfang und Betriebshinweise

`open-compute-mcp` ist ein Node.js-Launcher für den separaten Python-Server [open-compute](https://github.com/ellmos-ai/open-compute). Er leitet die MCP-stdio-Datenströme an einen Kindprozess weiter. Dieser Transport filtert keinen Netzwerkzugriff.

- Die npm-Installation kontaktiert npm. Der Standardstart mit `uvx` lädt das Python-Projekt von GitHub; der optionale Update-Hinweis im interaktiven Terminal kann npm abfragen. Der Python-Kindprozess und der MCP-Client können eigene Netzwerkanfragen stellen.
- Der Kindprozess erbt Umgebung und Betriebssystemrechte des startenden Prozesses. Dieses Paket stellt weder Sandbox noch Firewall, Umgebungsbereinigung oder Rechteabbau bereit.
- Aktionsmodi, Sperrlisten, Eingabezielauswahl und Signalverhalten gehören zum Python-Server. Prüfe dessen Dokumentation und richte die eigenen Werkzeugfreigaben des MCP-Clients ein. Dieser Launcher erzwingt diese Freigaben nicht.
- Echte Bildschirmaufnahme und Eingaben erfordern einen interaktiven Windows-Desktop auf dem Host des MCP-Clients. Werkzeugergebnisse einschließlich Screenshots werden über den MCP-Client zurückgegeben; der Client steuert deren weitere Weiterleitung und Speicherung.
- Die Tests des Node.js-Wrappers zertifizieren weder Live-Desktop-Verhalten noch Providerverhalten oder Netzwerktrennung.

Behandle Bildschirminhalte und andere externe Eingaben als nicht vertrauenswürdig. Prüfe Berechtigungen und Netzwerkzugriff für den gesamten Prozessbaum und den gewählten MCP-Client.
