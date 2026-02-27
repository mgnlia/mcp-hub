import type { MCPServer, RegistryResponse } from "@/types/mcp";

const REGISTRY_BASE = "https://registry.modelcontextprotocol.io";
const REVALIDATE_SECONDS = 300; // 5 min cache

export async function fetchServers(params?: {
  cursor?: string;
  limit?: number;
  query?: string;
}): Promise<RegistryResponse> {
  const url = new URL(`${REGISTRY_BASE}/v0/servers`);
  if (params?.cursor) url.searchParams.set("cursor", params.cursor);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.query) url.searchParams.set("q", params.query);

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Registry fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchServer(id: string): Promise<MCPServer> {
  const res = await fetch(`${REGISTRY_BASE}/v0/servers/${encodeURIComponent(id)}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return data.server ?? data;
}

export async function fetchAllServers(): Promise<MCPServer[]> {
  const all: MCPServer[] = [];
  let cursor: string | undefined;

  do {
    const page: RegistryResponse = await fetchServers({ cursor, limit: 100 });
    all.push(...page.servers);
    cursor = page.next_cursor;
  } while (cursor);

  return all;
}

// Derive a category from server name/description
export function deriveCategory(server: MCPServer): string {
  const text = `${server.name} ${server.description}`.toLowerCase();

  if (/github|gitlab|git\b|version control|repository/.test(text)) return "Dev Tools";
  if (/database|postgres|mysql|sqlite|sql|mongo|redis/.test(text)) return "Database";
  if (/search|web|browser|fetch|crawl|scrape/.test(text)) return "Web & Search";
  if (/file|filesystem|storage|s3|blob/.test(text)) return "Files & Storage";
  if (/slack|discord|email|gmail|calendar|notion|linear|jira/.test(text)) return "Productivity";
  if (/aws|azure|gcp|cloud|kubernetes|docker/.test(text)) return "Cloud & Infra";
  if (/ai|llm|openai|anthropic|image|vision|audio/.test(text)) return "AI & ML";
  if (/finance|payment|stripe|crypto|blockchain/.test(text)) return "Finance";
  if (/map|location|geo|weather/.test(text)) return "Data & APIs";
  if (/memory|knowledge|graph/.test(text)) return "Memory";
  return "General";
}

export function getPackageInstallCmd(server: MCPServer): string | null {
  const pkg = server.packages?.[0];
  if (!pkg) return null;

  switch (pkg.registry_name) {
    case "npm":
      return `npx ${pkg.name}`;
    case "pypi":
      return `uvx ${pkg.name}`;
    case "docker":
      return `docker run ${pkg.name}`;
    default:
      return null;
  }
}

export function getRepoUrl(server: MCPServer): string | null {
  return server.repository?.url ?? null;
}
