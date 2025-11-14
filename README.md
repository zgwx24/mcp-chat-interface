<a href="https://mcp.scira.ai">
  <h1 align="center">Scira MCP Chat</h1>
</a>

<p align="center">
  An open-source AI chatbot app powered by Model Context Protocol (MCP), built with Next.js and the AI SDK by Vercel.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> •
  <a href="#mcp-server-configuration"><strong>MCP Configuration</strong></a> •
  <a href="#license"><strong>License</strong></a>
</p>
<br/>


二、如何使用 Scira MCP Chat

下面是一步步接入和使用的方法：

克隆 / 部署 Scira MCP Chat

从 GitHub 克隆它：git clone https://github.com/zaidmukaddam/scira-mcp-chat.git
kdjingpai.com
+2
creati.ai
+2

安装依赖：npm install

配置环境变量 .env.local，至少设置 AI 提供商 (例如 OpenAI) 的 key。
kdjingpai.com
+1

启动开发服务器：npm run dev，然后访问 http://localhost:3000。
kdjingpai.com

连接你的 MCP Server

打开 Scira Chat 的界面后：点击右上角 ⚙️ 设置图标。
GitHub

添加 MCP 服务器：

输入 名称 (name)

选择传输类型 (transport)：HTTP / SSE / stdio
mcp.pizza
+1

如果是 HTTP / SSE，输入你的 MCP Server 的 URL (例如 http://127.0.0.1:3000/mcp)。
GitHub

如果是 stdio，输入你的命令 (例如 uv run weather.py 或 python server.py)。
GitHub

点 “Add Server” → 之后在同一个界面点 “Use” 激活这个服务器。
mcp.pizza

选择 AI 模型

在聊天界面，有模型选择器 (Model Picker)；你可以选 OpenAI、xAI 等模型 (取决于 Scira Chat 支持的 AI SDK)
kdjingpai.com
+1

切换模型后，新的对话会用该模型。

和 AI 聊天 + 使用工具

在输入框中输入你的问题 /命令，它会发送给 AI + MCP Server。

如果 MCP Server 上有工具 (tool)，AI 可以 “调用工具” 并把结果返回给你。

如果工具返回一个 UIResource (HTML + 交互组件)，Scira Chat 可以把它渲染为交互式 UI (按钮 /表单 /视图)
GitHub

你可以和这些 UI 组件互动 (点击按钮、填写表单)，这些交互会触发新的 tool 调用 (或 Intent)。

切换 /管理 MCP 服务器

你可以在设置里添加多个 MCP server。
creati.ai

切换 “Use” 的服务器，即可在当前 chat 会话中使用不同 MCP Server。

二、如何使用 Scira MCP Chat
下面是一步步接入和使用的方法：

克隆 / 部署 Scira MCP Chat
从 GitHub 克隆它：git clone https://github.com/zaidmukaddam/scira-mcp-chat.git
kdjingpai.com
+2
creati.ai
+2

安装依赖：npm install

配置环境变量 .env.local，至少设置 AI 提供商 (例如 OpenAI) 的 key。
kdjingpai.com
+1

启动开发服务器：npm run dev，然后访问 http://localhost:3000。
kdjingpai.com

连接你的 MCP Server
打开 Scira Chat 的界面后：点击右上角 ⚙️ 设置图标。
GitHub

添加 MCP 服务器：

输入 名称 (name)

选择传输类型 (transport)：HTTP / SSE / stdio
mcp.pizza
+1

如果是 HTTP / SSE，输入你的 MCP Server 的 URL (例如 http://127.0.0.1:3000/mcp)。
GitHub

如果是 stdio，输入你的命令 (例如 uv run weather.py 或 python server.py)。
GitHub

点 “Add Server” → 之后在同一个界面点 “Use” 激活这个服务器。
mcp.pizza

选择 AI 模型
在聊天界面，有模型选择器 (Model Picker)；你可以选 OpenAI、xAI 等模型 (取决于 Scira Chat 支持的 AI SDK)
kdjingpai.com
+1

切换模型后，新的对话会用该模型。

和 AI 聊天 + 使用工具
在输入框中输入你的问题 /命令，它会发送给 AI + MCP Server。

如果 MCP Server 上有工具 (tool)，AI 可以 “调用工具” 并把结果返回给你。

如果工具返回一个 UIResource (HTML + 交互组件)，Scira Chat 可以把它渲染为交互式 UI (按钮 /表单 /视图)
GitHub

你可以和这些 UI 组件互动 (点击按钮、填写表单)，这些交互会触发新的 tool 调用 (或 Intent)。

切换 /管理 MCP 服务器
你可以在设置里添加多个 MCP server。
creati.ai

切换 “Use” 的服务器，即可在当前 chat 会话中使用不同 MCP Server。






## Features

- Streaming text responses powered by the [AI SDK by Vercel](https://sdk.vercel.ai/docs), allowing multiple AI providers to be used interchangeably with just a few lines of code.
- Full integration with [Model Context Protocol (MCP)](https://modelcontextprotocol.io) servers to expand available tools and capabilities.
- HTTP and SSE transport types for connecting to various MCP tool providers.
- Built-in tool integration for extending AI capabilities.
- Reasoning model support.
- [shadcn/ui](https://ui.shadcn.com/) components for a modern, responsive UI powered by [Tailwind CSS](https://tailwindcss.com).
- Built with the latest [Next.js](https://nextjs.org) App Router.

## MCP Server Configuration

This application supports connecting to Model Context Protocol (MCP) servers to access their tools. You can add and manage MCP servers through the settings icon in the chat interface.

### Adding an MCP Server

1. Click the settings icon (⚙️) next to the model selector in the chat interface.
2. Enter a name for your MCP server.
3. Select the transport type:
   - **HTTP**: For HTTP-based remote servers
   - **SSE (Server-Sent Events)**: For SSE-based remote servers

#### HTTP or SSE Configuration

1. Enter the server URL (e.g., `https://mcp.example.com/mcp` or `https://mcp.example.com/token/sse`)
2. Click "Add Server"
3. Click "Enable Server" to activate the server for the current chat session.

### Available MCP Servers

You can use any MCP-compatible server with this application. Here are some examples:

- [Composio](https://composio.dev/mcp) - Provides search, code interpreter, and other tools
- [Zapier MCP](https://zapier.com/mcp) - Provides access to Zapier tools
- [Hugging Face MCP](https://huggingface.co/mcp) - Provides tool access to Hugging Face Hub
- Any MCP server compatible with HTTP or SSE transport

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
