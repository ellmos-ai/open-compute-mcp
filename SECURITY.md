# Security Policy / Sicherheitsrichtlinie

[English](#english) | [Deutsch](#deutsch)

---

<a name="english"></a>
## English

### Reporting a Vulnerability

Please report security issues privately via GitHub **[Private Vulnerability Reporting](https://github.com/ellmos-ai/open-compute-mcp/security/advisories)** or directly via email:
- **Security Contact:** [security@ellmos.ai](mailto:security@ellmos.ai)
- **Maintainer:** [support@lukasgeiger.com](mailto:support@lukasgeiger.com)

We acknowledge receipt of vulnerability reports within 48 hours and coordinate remediation steps prior to public disclosure.

### Scope & Operational Safety

`open-compute-mcp` is a lightweight Node.js launcher; the core computer-use engine runs via the Python [open-compute](https://github.com/ellmos-ai/open-compute) server it spawns. GUI automation and desktop interaction carry operational responsibilities:

- **Operator Ceiling (`OC_SAFETY_MODE`):** Configured as a strict operator ceiling (`confirm` default · `read_only` · `allow_all`). A per-call `mode` argument can only *tighten* the policy, never loosen it. Under stdio MCP, `confirm` and `read_only` report actions for confirmation without executing them.
- **Interactive Execution:** Interactive use (`allow_all`) should only run in an **isolated VM or session**, using the MCP client's native tool-approval dialog as the human-in-the-loop gate.
- **Hard Deny Lists (`OC_DENY`):** Allows hard-denying specific action types (e.g., `type,launch_app`).
- **Visual Signal Overlay & Abort Hotkey:** Visual indicators (`signal_show`, `signal_hide`, `signal_abort`) provide continuous feedback (glowing screen border, colored cursor ring) and an immediate human abort mechanism.
- **Hold-Primitive Auto-Release:** Any keys or mouse buttons held down (`mouse_down`, `key_down`) are automatically released when the server shuts down or on abort.
- **Local-First & Zero Egress:** The launcher communicates strictly via local stdio JSON-RPC. It never transmits screenshots, telemetry, or system information to remote services.
- **User-Mode Non-Elevation:** Operates entirely with standard user privileges; administrative elevation (root/administrator) is neither required nor recommended.
- **Prompt Injection Defense:** Always treat on-screen text and captured graphical content as untrusted input.

---

<a name="deutsch"></a>
## Deutsch

### Sicherheitslücke melden

Bitte melden Sie Sicherheitslücken vertraulich über die GitHub-Funktion **[Private Vulnerability Reporting](https://github.com/ellmos-ai/open-compute-mcp/security/advisories)** oder direkt per E-Mail:
- **Sicherheitskontakt:** [security@ellmos.ai](mailto:security@ellmos.ai)
- **Maintainer:** [support@lukasgeiger.com](mailto:support@lukasgeiger.com)

Wir bestätigen den Eingang von Meldungen innerhalb von 48 Stunden und stimmen Behebungsmaßnahmen vor einer Veröffentlichung ab.

### Geltungsbereich & Betriebssicherheit

`open-compute-mcp` ist ein schlanker Node.js-Launcher; die eigentliche Computer-Use-Ausführung liegt im Python-Server [open-compute](https://github.com/ellmos-ai/open-compute). Desktop- und GUI-Automatisierung erfordern klare Sicherheitsleitplanken:

- **Operator-Obergrenze (`OC_SAFETY_MODE`):** Dient als strikte Operator-Obergrenze (`confirm` Standard · `read_only` · `allow_all`). Ein aufrufbezogenes `mode`-Argument kann die Richtlinie nur *verschärfen*, nie lockern. Unter stdio-MCP melden `confirm` und `read_only` Aktionen zur Bestätigung, ohne sie auszuführen.
- **Interaktive Ausführung:** Interaktiver Betrieb (`allow_all`) sollte ausschließlich in einer **isolierten VM oder Session** stattfinden, wobei der clientseitige Tool-Bestätigungsdialog als Human-in-the-Loop fungiert.
- **Harte Ausschlusslisten (`OC_DENY`):** Ermöglicht das dauerhafte Sperren bestimmter Aktionstypen (z. B. `type,launch_app`).
- **Visuelles Signal-Overlay & Abbruch-Hotkey:** Visuelle Signale (`signal_show`, `signal_hide`, `signal_abort`) bieten stetige optische Rückmeldung (leuchtender Bildschirmrahmen, farbiger Cursor-Ring) sowie eine sofortige manuelle Abbruchmöglichkeit per Hotkey.
- **Automatisches Loslassen von Halte-Primitiven:** Alle gehaltenen Tasten oder Maustasten (`mouse_down`, `key_down`) werden bei Serverbeendigung oder Abbruch zuverlässig freigegeben.
- **Local-First & Zero-Egress:** Der Launcher kommuniziert ausschließlich über lokales stdio-JSON-RPC. Es werden keinerlei Screenshots, Telemetriedaten oder Systemdaten an externe Server übertragen.
- **User-Mode Non-Elevation:** Läuft vollständig mit regulären Benutzerrechten; Administratorrechte sind weder erforderlich noch empfohlen.
- **Prompt-Injection-Schutz:** Auf dem Bildschirm dargestellte Texte und grafische Inhalte müssen stets als nicht vertrauenswürdig eingestuft werden.
