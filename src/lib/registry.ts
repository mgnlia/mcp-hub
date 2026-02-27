import type {
  MCPServer,
  MCPServerListItem,
  RegistryResponse,
  RegistryResponseRaw,
} from "@/types/mcp";

const REGISTRY_BASE = "https://registry.modelcontextprotocol.io";
const REVALIDATE_SECONDS = 300; // 5 min cache

// ─── Normalise a raw list item into our MCPServer shape ──────────────────────
function normaliseServer(item: MCPServerListItem): MCPServer {
  const s = item.server;
  const meta = item._meta?.["io.modelcontextprotocol.registry/official"];

  // Derive a stable id from the name slug
  const id = s.name ?? "unknown";

  return {
    id,
    name: s.name ?? "Unknown",
    description: s.description ?? s.title ?? "",
    created_at: meta?.publishedAt ?? new Date().toISOString(),
    updated_at: meta?.updatedAt ?? new Date().toISOString(),
    version_detail: s.version
      ? {
          version: s.version,
          release_date: meta?.updatedAt,
          is_latest: meta?.isLatest ?? true,
        }
      : undefined,
    packages: s.packages,
    repository: s.repository,
    remotes: s.remotes,
    websiteUrl: s.websiteUrl,
  };
}

// ─── Core fetch helper ───────────────────────────────────────────────────────
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
    // Ensure no stale cache in prod
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Registry fetch failed: ${res.status} ${res.statusText}`);
  }

  const raw: RegistryResponseRaw = await res.json();

  // Handle both new schema (servers[].server) and potential legacy flat schema
  const rawServers = raw.servers ?? [];
  const normalised: MCPServer[] = rawServers.map((item) => {
    // New schema: item has a "server" key
    if (item && typeof item === "object" && "server" in item) {
      return normaliseServer(item as MCPServerListItem);
    }
    // Legacy flat schema: item IS the server
    const legacy = item as unknown as MCPServer;
    return legacy;
  });

  // Cursor: new schema uses metadata.nextCursor, legacy uses next_cursor
  const next_cursor = raw.metadata?.nextCursor ?? raw.next_cursor;

  return {
    servers: normalised,
    next_cursor,
    total_count: raw.metadata?.count ?? raw.total_count,
  };
}

// ─── Fetch a single server by id ─────────────────────────────────────────────
export async function fetchServer(id: string): Promise<MCPServer> {
  const res = await fetch(`${REGISTRY_BASE}/v0/servers/${encodeURIComponent(id)}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status}`);
  }

  const data = await res.json();

  // Handle both wrapped and unwrapped responses
  if (data?.server) {
    return normaliseServer({ server: data.server, _meta: data._meta });
  }
  return data as MCPServer;
}

// ─── Fetch all servers (paginated) ───────────────────────────────────────────
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

// ─── Category derivation ─────────────────────────────────────────────────────
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

// ─── Install command helper ───────────────────────────────────────────────────
export function getPackageInstallCmd(server: MCPServer): string | null {
  const pkg = server.packages?.[0];
  if (!pkg) return null;

  // New schema uses registryType + identifier
  const type = pkg.registryType ?? pkg.registry_name;
  const name = pkg.identifier ?? pkg.name;
  if (!name) return null;

  switch (type) {
    case "npm":
      return `npx ${name}`;
    case "pypi":
      return `uvx ${name}`;
    case "oci":
    case "docker":
      return `docker run ${name}`;
    default:
      return null;
  }
}

// ─── Repository URL helper ────────────────────────────────────────────────────
export function getRepoUrl(server: MCPServer): string | null {
  return server.repository?.url ?? null;
}

// ─── Package type label helper ────────────────────────────────────────────────
export function getPackageType(server: MCPServer): string | null {
  const pkg = server.packages?.[0];
  if (!pkg) return null;
  return pkg.registryType ?? pkg.registry_name ?? null;
}
