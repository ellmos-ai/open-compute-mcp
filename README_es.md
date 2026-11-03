<p align="center">
  <img src="https://raw.githubusercontent.com/ellmos-ai/open-compute-mcp/main/assets/wappen.jpg" alt="emblema del servidor MCP de open-compute" width="300">
</p>

# open-compute-mcp

> Lanzador npm para el servidor MCP de Python [open-compute](https://github.com/ellmos-ai/open-compute). Reenvía MCP JSON-RPC por stdin/stdout local. La captura real de pantalla y la entrada requieren un escritorio interactivo de Windows en el host del cliente MCP. No se ofrece un despliegue de escritorio alojado en Glama ni en la nube.

Esta página de inicio breve sustituye a la guía extensa [README.md del commit predecesor 59cd953](https://github.com/ellmos-ai/open-compute-mcp/blob/59cd9530688b02c38b75d1926d5a1efdd1a4aa06/README.md). La guía detallada corregida está [archivada aquí](docs/archive/README-2026-10-12.md), donde conserva los antiguos anclajes de sección y diagramas. Es una copia corregida, no una instantánea histórica sin cambios; el original sigue disponible mediante el enlace al commit.

[![CI](https://github.com/ellmos-ai/open-compute-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/ellmos-ai/open-compute-mcp/actions/workflows/ci.yml) [![versión npm](https://img.shields.io/npm/v/open-compute-mcp.svg)](https://www.npmjs.com/package/open-compute-mcp) [![Pruebas: node --test](https://img.shields.io/badge/tests-43%20passed%20%7C%20100%25-brightgreen.svg)](test/) [![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/) [![Licencia: MIT](https://img.shields.io/github/license/ellmos-ai/open-compute-mcp.svg)](LICENSE) [![Servidor MCP](https://img.shields.io/badge/MCP-server-blue.svg)](https://modelcontextprotocol.io) [![Verificado: 2026-11-01](https://img.shields.io/badge/verified-2026--11--01-blue.svg)](CHANGELOG.md) [![Contexto para LLM](https://img.shields.io/badge/LLM-llms.txt-blue.svg)](llms.txt)

[English](README.md) | [Deutsch](README_de.md) | **Español**

## Instalar y ejecutar

Requiere Node.js 18 o posterior y `uv`. El backend requiere Python 3.10 o posterior; `uvx` puede usar un intérprete compatible ya instalado o descargarlo y gestionarlo cuando sea necesario. El inicio predeterminado obtiene el servidor Python de GitHub en la rama `master`; configura `OPEN_COMPUTE_GIT_REF` para elegir una rama, etiqueta o commit. Estos pasos de inicialización requieren acceso a la red.

Añade este servidor a un cliente MCP local:

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

El paquete npm se publica por separado de este repositorio Git; consulta la versión publicada si necesitas una revisión concreta del código fuente. Hay una configuración directa con `uvx` en la [guía de inicio rápido detallada](docs/archive/README-2026-10-12.md#sec-03).

## Arquitectura y flujo del protocolo

El lanzador conecta las solicitudes JSON-RPC del cliente, mediante stdio local, con el motor Python que se ejecuta en el escritorio interactivo de Windows:

```mermaid
sequenceDiagram
    autonumber
    actor Reasoner as AI Reasoner (Antigravity / Claude / Cursor)
    participant Launcher as Node.js Launcher (open-compute-mcp)
    participant Engine as Python MCP Server (open-compute via uvx)
    participant Desktop as Windows Desktop (WGC / UIA / Win32)
    actor Operator as Human Operator (Supervision & Approvals)

    Note over Reasoner,Operator: Phase 1 - Transport Initialization & Tool Discovery
    Reasoner->>Launcher: MCP stdio JSON-RPC (initialize / tools/list)
    Launcher->>Engine: Spawn Python process & pipe stdio
    Engine-->>Launcher: Return tool schemas (capture, tree, do, click_name)
    Launcher-->>Reasoner: Forward available tool definitions

    Note over Reasoner,Operator: Phase 2 - Desktop Inspection & Visual Context
    Reasoner->>Launcher: Call capture(window?) or tree()
    Launcher->>Engine: Forward tool invocation over stdio
    Engine->>Desktop: Windows Graphics Capture (WGC) or UI Automation inspect
    Desktop-->>Engine: Raw frame buffer / accessibility element tree
    Engine-->>Launcher: Formatted image (base64 PNG) or JSON tree result
    Launcher-->>Reasoner: Relay visual context to model

    Note over Reasoner,Operator: Phase 3 - Human Oversight & Gated Action Execution
    Reasoner->>Launcher: Propose action: do(click, x, y) or click_name(target)
    Launcher->>Engine: Forward action request over stdio
    alt Client Approval Gate
        Operator->>Engine: Confirm interactive desktop action
        Engine->>Desktop: Synthesize mouse / keyboard event via Win32 API
        Desktop-->>Engine: Action outcome & state change
        Engine-->>Launcher: Success status report
    else Deny or Boundary Check
        Engine-->>Launcher: Action blocked by policy or client denial
    end
    Launcher-->>Reasoner: Forward execution receipt
```

## Qué hace el lanzador

Inicia el servidor MCP de Python y reenvía stdio. El wrapper no implementa un filtro de red, una sandbox, una reducción de privilegios ni un mecanismo de limpieza del entorno. El proceso hijo hereda el entorno y los privilegios del sistema operativo del lanzador.

El comando predeterminado `uvx` obtiene el proyecto Python de GitHub; la instalación de npm se conecta a npm. En un terminal interactivo, el aviso opcional de actualización puede consultar npm. El stdio local describe el transporte entre el cliente y el wrapper; no bloquea el acceso a la red del proceso hijo ni el del cliente MCP. El cliente controla el enrutamiento de los resultados de las herramientas, incluidas las capturas de pantalla.

Para disponer de captura real y entrada, ejecuta el cliente MCP en el escritorio de Windows que quieras controlar. Los modos de acción y la selección de objetivos pertenecen al servidor Python; configura los controles de aprobación del cliente. Este wrapper no constituye una frontera de seguridad del sistema operativo.

## Herramientas y configuración

La [referencia de herramientas](docs/archive/README-2026-10-12.md#sec-04) es una instantánea de la lista de herramientas del proyecto Python independiente en una revisión de origen documentada. Los esquemas del servidor en ejecución determinan las herramientas disponibles para la revisión elegida. Consulta también las [variables de entorno](docs/archive/README-2026-10-12.md#sec-05).

## Integración relacionada

El [Cowork Protocol Desktop Companion](https://github.com/ellmos-ai/cowork-protocol/blob/main/apps/desktop-companion/README.md) incluye un adaptador opcional de uso del ordenador que inicia una persona y ejecuta el servidor MCP de Python Open Compute independiente mediante stdio local. La configuración predeterminada documentada usa `uvx`; este lanzador npm no es una dependencia de Cowork. Esta relación no modifica los límites de proceso, red o privilegios descritos anteriormente.

## Documentación

- [Alcance de la arquitectura y del comportamiento](docs/archive/README-2026-10-12.md#sec-01)
- [Alcance de seguridad y red](docs/archive/README-2026-10-12.md#sec-12)
- [Inventario seleccionado de dependencias](THIRD_PARTY_LICENSES.md)
- [Política de comunicación de vulnerabilidades](SECURITY.md)
- [Contribución](CONTRIBUTING.md)
- [Registro de cambios](CHANGELOG.md)

El manifiesto de origen del repositorio declara actualmente `0.1.0-alpha.20`. Este trabajo de documentación no cambia ninguna versión ni publica una versión nueva.
