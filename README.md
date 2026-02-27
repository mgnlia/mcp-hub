# MCP Hub 🚀

**The universal registry and playground for Model Context Protocol (MCP) servers.**

Browse 1000+ MCP servers, test tools live in your browser, and compose multi-server Claude Desktop configurations — all in one place.

🌐 **Live:** https://mcp-hub.vercel.app

---

## Features

- **🔍 Discover** — Browse the official MCP registry with instant search and category filters
- **🎮 Playground** — Test any MCP server's tools with mock inputs, no installation required
- **🔧 Composer** — Build multi-server configurations and export to `claude_desktop_config.json`
- **🔗 Share** — Share any configuration or playground session as a URL

## Tech Stack

- **Next.js 15** (App Router, Server Components)
- **TypeScript** — fully typed
- **Tailwind CSS** — dark-mode-first design
- **MCP Registry API** — `registry.modelcontextprotocol.io`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MCP Registry

Data is sourced live from the [official MCP Registry](https://registry.modelcontextprotocol.io) by Anthropic, refreshed every 5 minutes via Next.js ISR.

## Deploy

One-click deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mgnlia/mcp-hub)

## License

MIT
