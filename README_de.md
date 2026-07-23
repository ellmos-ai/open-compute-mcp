<p align="center">
  <img src="https://raw.githubusercontent.com/ellmos-ai/open-compute-mcp/main/assets/banner.png" alt="open-compute-mcp Banner" width="100%">
</p>

# open-compute-mcp

**npm-Launcher für den [open-compute](https://github.com/ellmos-ai/open-compute) MCP-Server** —
modellagnostische **Computer-Use**-Tools über das Model Context Protocol (MCP).

**EN** ([README.md](README.md)) | **DE**

[![npm version](https://img.shields.io/npm/v/open-compute-mcp.svg)](https://www.npmjs.com/package/open-compute-mcp)
[![npm downloads](https://img.shields.io/npm/dt/open-compute-mcp.svg)](https://www.npmjs.com/package/open-compute-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

📦 **[Auf npm ansehen →](https://www.npmjs.com/package/open-compute-mcp)**

Der MCP-**Client ist der Reasoner** (kein API-Key, modellagnostisch): Er ruft `capture`
auf, um den Bildschirm zu sehen, und handelt dann mit `do` / `click_name` / `invoke`.
Das ist die schlüssellose Modus-A-Schleife von open-compute, aber als native Tool-Calls.

> Dieses Paket ist ein **dünner Launcher**. Es enthält keine Server-Logik — es startet
> den **Python**-Server (open-compute) **von GitHub** und reicht MCP-stdio durch. Echtes
> Capture/Input braucht die interaktive **Windows**-Desktop-Session.

## Voraussetzungen

- **Python 3.10+** und **[uv](https://docs.astral.sh/uv/)** auf dem Host (der Standard
  zieht open-compute per `uvx` von GitHub — open-compute liegt bewusst nicht auf PyPI).
- **Windows** für echtes Capture/Input (mss + UIA).

## Tools

| Tool | Zweck |
|---|---|
| `capture` | Screenshot des Bildschirms → als Bild (optional nur ein Fenster). |
| `do` | Eine kanonische Aktion oder einen Stapel ausführen (Klick/Tippen/Taste/Scroll/Drag/Halten). |
| `tree` | UI-Elemente eines Fensters via Windows-UIA auflisten (Name/Rolle/`center_norm`). |
| `click_name` | Element per Name auflösen und anklicken. |
| `invoke` | Klickfreie Aktivierung eines Elements via UIA-Muster. |
| `list_windows` | Offene Fenster mit exakten Titeln, Rechtecken und normierten Mittelpunkten (nur Lesen). |
| `get_screen_size` | Geometrie des virtuellen Desktops + Monitor-Aufschlüsselung (nur Lesen). |
| `watch_dir` | Verzeichnisse auf Dateisystem-Änderungen überwachen. |
| `push_status` | Feed-Manager-Status (nur Lesen). |
| `rec_replay` | Ein `.clirec`-Makro abspielen (benötigt das optionale `clirec`-Paket). |

Alle Koordinaten sind **normiert 0..1** relativ zum virtuellen Desktop. Tool-Beschreibungen
sind in sechs Sprachen lokalisiert (`de/en/es/ja/ru/zh`) — wählbar über `OC_LANGUAGE`.

`do` akzeptiert zusätzlich die **Halte-Primitive** `mouse_down` / `mouse_up` /
`key_down` / `key_up` für Drücken-und-Halten-Sequenzen (Auswahlrahmen aufziehen,
modifikator-gehaltenes Klicken, Spiele-Eingaben); alles noch Gedrückte wird beim
Beenden des Servers wieder losgelassen. `capture(window=...)` weicht auf
Windows.Graphics.Capture aus, wenn ein normaler Grab eines hardware-komponierten
Fensters (Roblox Studio, Blender, GPU-beschleunigter Browser) komplett schwarz
zurückkommt — dafür das `wgc`-Extra installieren.

## Nutzung mit einem MCP-Client

**Über diesen npm-Launcher (npx):**

```json
{
  "mcpServers": {
    "open-compute": {
      "command": "npx",
      "args": ["-y", "open-compute-mcp"]
    }
  }
}
```

**Direkt über Python (uvx), ohne npm:**

```json
{
  "mcpServers": {
    "open-compute": {
      "command": "uvx",
      "args": ["--from", "open-compute[mcp,local,uia] @ git+https://github.com/ellmos-ai/open-compute.git", "open-compute-mcp"]
    }
  }
}
```

## Konfiguration (Umgebungsvariablen)

| Variable | Wirkung |
|---|---|
| `OPEN_COMPUTE_PYTHON` | Pfad zu einer `python.exe`; startet damit `-m open_compute.mcp_server`. |
| `OPEN_COMPUTE_MCP_CMD` | Voller Befehls-Override (per Leerzeichen getrennt). |
| `OPEN_COMPUTE_GIT_REF` | Git-Ref (Branch/Tag/SHA) zum Pinnen des uvx-Launch (Default: der Default-Branch des Repos). |
| `OPEN_COMPUTE_EXTRAS` | Extras für den uvx-Launch (Default `mcp,local,uia`). |
| `OC_LANGUAGE` | Sprache der Tool-Beschreibungen: `de`/`en`/`es`/`ja`/`ru`/`zh`. |
| `OC_SAFETY_MODE` | `confirm` (Default) · `read_only` · `allow_all`. |
| `OC_DENY` | Kommagetrennte Aktionstypen, die immer verweigert werden. |

## Sicherheit

Computer-Use ist mächtig. `OC_SAFETY_MODE` ist eine Operator-**Obergrenze** (`confirm`
Standard · `read_only` · `allow_all`); ein per-Call-`mode` kann sie nur *verschärfen*, nie
lockern. Da MCP-stdio keinen Server→Client-Confirm-Callback hat, **melden** `confirm`/
`read_only` eine Aktion, ohne sie auszuführen. Für interaktiven Betrieb in einer
**isolierten VM/Session** `OC_SAFETY_MODE=allow_all` setzen und den Tool-Berechtigungsdialog
des Clients als Human-in-the-Loop nutzen. `OC_DENY` ist eine harte Deny-Liste. Behandle
Bildschirminhalte als nicht vertrauenswürdig (Prompt-Injection-Risiko).

**Troubleshooting: `do`/`click_name` liefern nur `needs_confirmation` und handeln
nie.** Das ist die `confirm`-Obergrenze, die unter stdio-MCP designgemäß so wirkt.
Fix für interaktiven Betrieb: `"env": {"OC_SAFETY_MODE": "allow_all"}` in der
Server-Registrierung setzen und jede Aktion durch den Tool-Berechtigungsdialog des
Clients gaten lassen (`do`/`click_name`/`invoke` dort **nicht** pauschal erlauben).
Die env-Änderung greift erst, wenn der Serverprozess neu startet — ein bereits
verbundener Client behält die alte Obergrenze bis zum Reconnect.

## Lizenz

MIT — siehe [LICENSE](LICENSE). Teil des open-compute-Projekts.

---

## ellmos-ai-Ökosystem

Dieser MCP-Server ist Teil des **[ellmos-ai](https://github.com/ellmos-ai)**-Ökosystems — KI-Infrastruktur, MCP-Server und intelligente Werkzeuge.

### MCP-Server-Familie

| Server | Tools | Fokus | npm |
|--------|-------|-------|-----|
| [FileCommander](https://github.com/ellmos-ai/ellmos-filecommander-mcp) | 46 | Dateisystem, Prozessverwaltung, interaktive Sitzungen, Cloud-Lock-sichere Operationen | [`ellmos-filecommander-mcp`](https://www.npmjs.com/package/ellmos-filecommander-mcp) |
| [CodeCommander](https://github.com/ellmos-ai/ellmos-codecommander-mcp) | 22 | Code-Analyse, JSON-Reparatur, Imports, Diffs, Regex | [`ellmos-codecommander-mcp`](https://www.npmjs.com/package/ellmos-codecommander-mcp) |
| [Clatcher](https://github.com/ellmos-ai/ellmos-clatcher-mcp) | 12 | Dateireparatur, Formatkonvertierung, Batch-Operationen | [`ellmos-clatcher-mcp`](https://www.npmjs.com/package/ellmos-clatcher-mcp) |
| [n8n Manager](https://github.com/ellmos-ai/n8n-manager-mcp) | 18 | n8n-Workflow-Verwaltung über KI-Assistenten | [`n8n-manager-mcp`](https://www.npmjs.com/package/n8n-manager-mcp) |
| [ControlCenter](https://github.com/ellmos-ai/ellmos-controlcenter-mcp) | 20 | MCP-Stack-Discovery, Profilverwaltung, Control Plane | [`ellmos-controlcenter-mcp`](https://www.npmjs.com/package/ellmos-controlcenter-mcp) |
| [Homebase](https://github.com/ellmos-ai/ellmos-homebase-mcp) | 45 | Local-first LLM-Gedächtnis, Wissen, Zustand, Routing, Schwarm-Orchestrierung | [`ellmos-homebase-mcp`](https://www.npmjs.com/package/ellmos-homebase-mcp) (alpha) |
| [ServerCommander](https://github.com/ellmos-ai/ellmos-servercommander-mcp) | 8 | Server-Operationen: Health-Checks, Log-Analyse, Deploy-Dry-Runs, Mail-Diagnose | [`ellmos-servercommander-mcp`](https://www.npmjs.com/package/ellmos-servercommander-mcp) (alpha) |
| [Blender Use](https://github.com/ellmos-ai/ellmos-blender-use-mcp) | 3 | Headless Blender-Asset-QA und FBX-Reimport-Verifikation | [`ellmos-blender-use-mcp`](https://www.npmjs.com/package/ellmos-blender-use-mcp) (alpha) |
| **[Open Compute](https://github.com/ellmos-ai/open-compute-mcp)** | **10** | **Modell-agnostischer Computer-Use: Capture, safety-gated Aktionen, Windows-UIA** | **[`open-compute-mcp`](https://www.npmjs.com/package/open-compute-mcp)** (alpha) |

### KI-Infrastruktur

| Projekt | Beschreibung |
|---------|-------------|
| [BACH](https://github.com/ellmos-ai/bach) | Local-first textbasiertes OS für LLM-Agenten — 113+ Handler, 550+ Tools, SQLite-Memory |
| [open-compute](https://github.com/ellmos-ai/open-compute) | Modell-agnostischer Computer-Use-Kern hinter Open Compute MCP |
| [clutch](https://github.com/ellmos-ai/clutch) | Provider-neutrale LLM-Orchestrierung mit Auto-Routing und Budget-Tracking |
| [rinnsal](https://github.com/ellmos-ai/rinnsal) | Leichte Agent-Memory-, Connector- und Automatisierungsinfrastruktur |
| [ellmos-stack](https://github.com/ellmos-ai/ellmos-stack) | Self-hosted AI Research Stack (Ollama + n8n + Rinnsal + KnowledgeDigest) |
| [MarbleRun](https://github.com/ellmos-ai/MarbleRun) | Autonomes Agent-Chain-Framework für Claude Code |
| [gardener](https://github.com/ellmos-ai/gardener) | Minimalistischer datenbankgetriebener LLM-OS-Prototyp (4 Funktionen, 1 Tabelle) |
| [ellmos-tests](https://github.com/ellmos-ai/ellmos-tests) | Testframework für LLM-Betriebssysteme (7 Dimensionen) |

### Desktop-Software

Unsere Partnerorganisation **[open-bricks](https://github.com/open-bricks)** bündelt KI-native Desktop-Anwendungen: eine moderne Open-Source-Softwaresuite für Datei-, Dokumenten- und Entwicklerwerkzeuge.
