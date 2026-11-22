<p align="center">
  <img src="https://raw.githubusercontent.com/ellmos-ai/open-compute-mcp/main/assets/wappen.jpg" alt="open-compute MCP 服务器徽章" width="300">
</p>

# open-compute-mcp

> 面向 Python 版 [open-compute MCP 服务器](https://github.com/ellmos-ai/open-compute) 的 npm 启动器。它通过本地 stdin/stdout 转发 MCP JSON-RPC。实际的屏幕捕获与输入操作需要在 MCP 客户端所在主机上具备交互式 Windows 桌面。本包不提供 Glama 或其他托管/云端桌面部署。

此简短入口页替代了[前置提交 59cd953 中的长篇 README.md](https://github.com/ellmos-ai/open-compute-mcp/blob/59cd9530688b02c38b75d1926d5a1efdd1a4aa06/README.md)。修正后的详细指南已[归档于此](docs/archive/README-2026-10-12.md)，并保留了原有的章节锚点和图表。这是一份经修正的副本，而非未作修改的历史快照；原始版本仍可通过该提交链接查看。

[![CI](https://github.com/ellmos-ai/open-compute-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/ellmos-ai/open-compute-mcp/actions/workflows/ci.yml) [![npm 版本](https://img.shields.io/npm/v/open-compute-mcp.svg)](https://www.npmjs.com/package/open-compute-mcp) [![测试：node --test](https://img.shields.io/badge/tests-48%20passed%20%7C%20100%25-brightgreen.svg)](test/) [![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/) [![许可证：MIT](https://img.shields.io/github/license/ellmos-ai/open-compute-mcp.svg)](LICENSE) [![MCP 服务器](https://img.shields.io/badge/MCP-server-blue.svg)](https://modelcontextprotocol.io) [![已验证：2026-11-08](https://img.shields.io/badge/verified-2026--11--08-blue.svg)](CHANGELOG.md) [![LLM 上下文](https://img.shields.io/badge/LLM-llms.txt-blue.svg)](llms.txt)

[English](README.md) | [Deutsch](README_de.md) | [Español](README_es.md) | [Français](README_fr.md) | [Português](README_pt.md) | [Русский](README_ru.md) | **简体中文** | [日本語](README_ja.md) | [العربية](README_ar.md) | [हिन्दी](README_hi.md) | [বাংলা](README_bn.md)

## 安装与运行

需要 Node.js 18 或更高版本以及 `uv`。后端需要 Python 3.10 或更高版本；`uvx` 可使用已安装的兼容解释器，或在需要时自行下载并管理。默认启动会从 GitHub 的 `master` 分支拉取 Python 服务器；设置 `OPEN_COMPUTE_GIT_REF` 可指定分支、标签或提交。这些初始化引导步骤需要网络访问权限。

将此服务器添加到本地 MCP 客户端：

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

npm 包与本 Git 仓库分开发布；如需对应特定源码修订版，请核对已发布的 npm 版本。直接使用 `uvx` 的配置见[详细快速入门](docs/archive/README-2026-10-12.md#sec-03)。

## 架构与协议流程

启动器通过本地 stdio 将客户端的 JSON-RPC 请求桥接至运行在交互式 Windows 桌面上的 Python 引擎：

```mermaid
sequenceDiagram
    autonumber
    actor Reasoner as AI 推理器 (Antigravity / Claude / Cursor)
    participant Launcher as Node.js 启动器 (open-compute-mcp)
    participant Engine as Python MCP 服务器 (通过 uvx 运行 open-compute)
    participant Desktop as Windows 桌面 (WGC / UIA / Win32)
    actor Operator as 人类操作员 (监督与审批)

    Note over Reasoner,Operator: Phase 1 - 传输初始化与工具发现
    Reasoner->>Launcher: MCP stdio JSON-RPC (initialize / tools/list)
    Launcher->>Engine: 启动 Python 进程并管道连接 stdio
    Engine-->>Launcher: 返回工具模式定义 (capture, tree, do, click_name)
    Launcher-->>Reasoner: 转发可用工具定义

    Note over Reasoner,Operator: Phase 2 - 桌面检查与视觉上下文
    Reasoner->>Launcher: 调用 capture(window?) 或 tree()
    Launcher->>Engine: 通过 stdio 转发工具调用
    Engine->>Desktop: Windows Graphics Capture (WGC) 或 UI Automation 检查
    Desktop-->>Engine: 原始帧缓冲区或无障碍元素树
    Engine-->>Launcher: 格式化图像 (base64 PNG) 或 JSON 树结果
    Launcher-->>Reasoner: 将视觉上下文传递至模型

    Note over Reasoner,Operator: Phase 3 - 人工监督与受控执行
    Reasoner->>Launcher: 提议操作：do(click, x, y) 或 click_name(target)
    Launcher->>Engine: 通过 stdio 转发操作请求
    alt 客户端审批关卡
        Operator->>Engine: 确认交互式桌面操作
        Engine->>Desktop: 通过 Win32 API 合成鼠标或键盘事件
        Desktop-->>Engine: 操作结果与状态变更
        Engine-->>Launcher: 成功状态报告
    else 拒绝或边界检查
        Engine-->>Launcher: 操作被策略拦截或遭客户端拒绝
    end
    Launcher-->>Reasoner: 转发执行回执
```

## 启动器的作用

它负责启动 Python MCP 服务器并转发 stdio。该包装器不实现网络过滤器、沙箱、权限降级或环境变量清理。子进程会继承启动器的环境变量与操作系统权限。

默认的 `uvx` 命令会从 GitHub 获取 Python 项目；npm 安装则会连接 npm。在交互式终端中，可选的更新提示可能会查询 npm。本地 stdio 仅描述客户端与包装器之间的传输方式，并不阻止子进程或 MCP 客户端访问网络。包括屏幕截图在内的工具结果如何路由均由客户端控制。

如需执行实际的屏幕捕获和输入，请在受控的 Windows 桌面上运行 MCP 客户端。操作模式与目标定位属于 Python 服务器的职责；请配置客户端的审批控制。此包装器不构成操作系统安全边界。

## 工具与配置

[工具参考](docs/archive/README-2026-10-12.md#sec-04)是独立 Python 项目在已记录源码引用处的工具列表快照。所选引用的可用工具由运行中服务器的模式定义决定。另请参阅[环境变量](docs/archive/README-2026-10-12.md#sec-05)。

## 相关集成

[Cowork Protocol Desktop Companion](https://github.com/ellmos-ai/cowork-protocol/blob/main/apps/desktop-companion/README.md) 包含一个可选的、由人工启动的计算机使用适配器，通过本地 stdio 启动独立的 Python 版 Open Compute MCP 服务器。其文档记录的默认配置使用 `uvx`；本 npm 启动器并非 Cowork 的依赖项。此关联不会改变上述进程、网络或权限边界。

## 文档

- [架构与行为范围](docs/archive/README-2026-10-12.md#sec-01)
- [安全与网络范围](docs/archive/README-2026-10-12.md#sec-12)
- [精选依赖清单](THIRD_PARTY_LICENSES.md)
- [安全报告策略](SECURITY.md)
- [贡献指南](CONTRIBUTING.md)
- [变更日志](CHANGELOG.md)

当前仓库源码清单声明的版本为 `0.1.0-alpha.20`。本次文档工作不更改任何版本，也不发布任何版本包。
