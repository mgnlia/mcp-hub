import { Suspense } from "react";
import { fetchServers } from "@/lib/registry";
import { deriveCategory } from "@/lib/registry";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ServerGrid } from "@/components/ServerGrid";
import { StatsBar } from "@/components/StatsBar";
import type { MCPServer } from "@/types/mcp";

// Use dynamic rendering so the page always fetches fresh data at runtime
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function getServersWithCategories(): Promise<MCPServer[]> {
  try {
    const page1 = await fetchServers({ limit: 100 });
    let servers = page1.servers ?? [];

    // Only fetch page 2 if we have a cursor and got results
    if (page1.next_cursor && servers.length > 0) {
      try {
        const page2 = await fetchServers({ limit: 100, cursor: page1.next_cursor });
        servers = [...servers, ...(page2.servers ?? [])];
      } catch (e) {
        console.warn("[MCP Hub] Page 2 fetch failed (non-fatal):", e);
      }
    }

    const valid = servers.filter((s) => s && s.id);

    if (valid.length === 0) {
      console.warn("[MCP Hub] API returned 0 valid servers, using fallback");
      return getFallbackServers();
    }

    return valid.map((s) => ({ ...s, category: deriveCategory(s) }));
  } catch (err) {
    console.error("[MCP Hub] Registry fetch error, using fallback:", err);
    return getFallbackServers();
  }
}

function getFallbackServers(): MCPServer[] {
  return [
    {
      id: "io.github.github/github-mcp-server",
      name: "github/github-mcp-server",
      description: "GitHub's official MCP Server — manage repos, issues, PRs, and code via natural language.",
      created_at: "2025-04-01T00:00:00Z",
      updated_at: "2025-12-01T00:00:00Z",
      version_detail: { version: "0.3.0", release_date: "2025-12-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "docker", identifier: "ghcr.io/github/github-mcp-server" }],
      repository: { url: "https://github.com/github/github-mcp-server", source: "github" },
      category: "Dev Tools",
    },
    {
      id: "io.github.modelcontextprotocol/server-filesystem",
      name: "modelcontextprotocol/server-filesystem",
      description: "Secure file operations with configurable access controls for local filesystem.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-filesystem" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Files & Storage",
    },
    {
      id: "io.github.modelcontextprotocol/server-fetch",
      name: "modelcontextprotocol/server-fetch",
      description: "Web content fetching and conversion for efficient LLM usage.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-fetch" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Web & Search",
    },
    {
      id: "io.github.modelcontextprotocol/server-memory",
      name: "modelcontextprotocol/server-memory",
      description: "Knowledge graph-based persistent memory system for AI agents.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-memory" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Memory",
    },
    {
      id: "io.github.modelcontextprotocol/server-git",
      name: "modelcontextprotocol/server-git",
      description: "Tools to read, search, and manipulate Git repositories.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-git" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Dev Tools",
    },
    {
      id: "io.github.modelcontextprotocol/server-sequential-thinking",
      name: "modelcontextprotocol/server-sequential-thinking",
      description: "Dynamic and reflective problem-solving through thought sequences.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-sequential-thinking" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "AI & ML",
    },
    {
      id: "io.github.modelcontextprotocol/server-postgres",
      name: "modelcontextprotocol/server-postgres",
      description: "Read-only database access with schema inspection and SQL query execution.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-postgres" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Database",
    },
    {
      id: "io.github.modelcontextprotocol/server-slack",
      name: "modelcontextprotocol/server-slack",
      description: "Channel management and messaging capabilities for Slack workspaces.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-slack" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Productivity",
    },
    {
      id: "io.github.modelcontextprotocol/server-brave-search",
      name: "modelcontextprotocol/server-brave-search",
      description: "Web and local search using Brave's Search API.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-brave-search" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Web & Search",
    },
    {
      id: "io.github.modelcontextprotocol/server-puppeteer",
      name: "modelcontextprotocol/server-puppeteer",
      description: "Browser automation and web scraping using Puppeteer.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-puppeteer" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Web & Search",
    },
    {
      id: "io.github.modelcontextprotocol/server-google-maps",
      name: "modelcontextprotocol/server-google-maps",
      description: "Location services, directions, and place details via Google Maps API.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-google-maps" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Data & APIs",
    },
    {
      id: "io.github.modelcontextprotocol/server-aws-kb-retrieval",
      name: "modelcontextprotocol/server-aws-kb-retrieval",
      description: "Retrieval from AWS Knowledge Base using Bedrock Agent Runtime.",
      created_at: "2024-11-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
      version_detail: { version: "0.6.2", release_date: "2025-11-01T00:00:00Z", is_latest: true },
      packages: [{ registryType: "npm", identifier: "@modelcontextprotocol/server-aws-kb-retrieval" }],
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" },
      category: "Cloud & Infra",
    },
  ];
}

export default async function Home() {
  const servers = await getServersWithCategories();

  const categories = Array.from(new Set(servers.map((s) => s.category ?? "General"))).sort();
  const packageTypes = Array.from(
    new Set(
      servers.flatMap(
        (s) =>
          s.packages?.map((p) => {
            const t = (p.registryType ?? p.registry_name ?? "").toLowerCase();
            // Normalise "oci" to "docker" for the filter UI
            return t === "oci" ? "docker" : t;
          }) ?? []
      )
    )
  )
    .filter(Boolean)
    .sort();

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
