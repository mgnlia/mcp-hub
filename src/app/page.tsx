import { Suspense } from "react";
import { fetchServers } from "@/lib/registry";
import { deriveCategory } from "@/lib/registry";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ServerGrid } from "@/components/ServerGrid";
import { StatsBar } from "@/components/StatsBar";
import type { MCPServer } from "@/types/mcp";

async function getServersWithCategories(): Promise<MCPServer[]> {
  try {
    // Fetch first 2 pages to populate the UI quickly
    const page1 = await fetchServers({ limit: 100 });
    let servers = page1.servers;

    if (page1.next_cursor) {
      try {
        const page2 = await fetchServers({ limit: 100, cursor: page1.next_cursor });
        servers = [...servers, ...page2.servers];
      } catch {
        // page 2 optional
      }
    }

    return servers.map((s) => ({ ...s, category: deriveCategory(s) }));
  } catch {
    // Return fallback data if registry is unreachable
    return getFallbackServers();
  }
}

function getFallbackServers(): MCPServer[] {
  return [
    {
      id: "io.github.github/github-mcp-server",
      name: "io.github.github/github-mcp-server",
      description: "GitHub's official MCP Server — manage repos, issues, PRs, and code via natural language.",
      created_at: "2025-04-01T00:00:00Z",
      updated_at: "2025-12-01T00:00:00Z",
      version_detail: { version: "0.3.0", release_date: "2025-12-01T00:00:00Z", is_latest: true },
      packages: [{ registry_name: "docker", name: "ghcr.io/github/github-mcp-server" }],
      repository: { url: "https://github.com/github/github-mcp-server", source: "github" },
      category: "Dev Tools",
    },
    {
      id: "io.github.modelcontextprotocol/server-filesystem",
      name: "io.github.modelcontextprotocol/server-filesystem",
      description: "Secure file operations with configurable access controls for local filesystem.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registry_name: "npm", name: "@modelcontextprotocol/server-filesystem" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Files & Storage",
    },
    {
      id: "io.github.modelcontextprotocol/server-fetch",
      name: "io.github.modelcontextprotocol/server-fetch",
      description: "Web content fetching and conversion for efficient LLM usage.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registry_name: "npm", name: "@modelcontextprotocol/server-fetch" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Web & Search",
    },
    {
      id: "io.github.modelcontextprotocol/server-memory",
      name: "io.github.modelcontextprotocol/server-memory",
      description: "Knowledge graph-based persistent memory system for AI agents.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registry_name: "npm", name: "@modelcontextprotocol/server-memory" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Memory",
    },
    {
      id: "io.github.modelcontextprotocol/server-git",
      name: "io.github.modelcontextprotocol/server-git",
      description: "Tools to read, search, and manipulate Git repositories.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registry_name: "npm", name: "@modelcontextprotocol/server-git" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Dev Tools",
    },
    {
      id: "io.github.modelcontextprotocol/server-sequential-thinking",
      name: "io.github.modelcontextprotocol/server-sequential-thinking",
      description: "Dynamic and reflective problem-solving through thought sequences.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registry_name: "npm", name: "@modelcontextprotocol/server-sequential-thinking" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "AI & ML",
    },
  ];
}

export default async function Home() {
  const servers = await getServersWithCategories();

  const categories = Array.from(new Set(servers.map((s) => s.category ?? "General"))).sort();
  const packageTypes = Array.from(
    new Set(servers.flatMap((s) => s.packages?.map((p) => p.registry_name) ?? []))
  ).sort();

  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      <Navbar />
      <HeroSection totalServers={servers.length} />
      <StatsBar servers={servers} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="text-slate-400">Loading servers…</div>}>
          <ServerGrid
            initialServers={servers}
            categories={categories}
            packageTypes={packageTypes}
          />
        </Suspense>
      </main>
      <footer className="border-t border-white/5 mt-20 py-10 text-center text-slate-500 text-sm">
        <p>
          Data sourced from{" "}
          <a
            href="https://registry.modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            registry.modelcontextprotocol.io
          </a>{" "}
          · Built with ❤️ by{" "}
          <a
            href="https://github.com/mgnlia/mcp-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            MCP Hub
          </a>
        </p>
      </footer>
    </div>
  );
}
