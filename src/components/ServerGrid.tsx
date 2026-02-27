"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Filter, X, SlidersHorizontal, Loader2 } from "lucide-react";
import type { MCPServer, MCPServerListItem } from "@/types/mcp";
import { ServerCard } from "./ServerCard";
import { ServerDetailModal } from "./ServerDetailModal";
import { cn } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/lib/utils";

interface ServerGridProps {
  initialServers: MCPServer[];
  categories: string[];
  packageTypes: string[];
}

const PAGE_SIZE = 24;

function pkgType(p: { registryType?: string; registry_name?: string }): string {
  const t = (p.registryType ?? p.registry_name ?? "").toLowerCase();
  return t === "oci" ? "docker" : t;
}

function deriveCategory(server: MCPServer): string {
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

function normaliseItem(item: MCPServerListItem): MCPServer | null {
  try {
    const s = item.server;
    if (!s?.name) return null;
    const meta = item._meta?.["io.modelcontextprotocol.registry/official"];
    const server: MCPServer = {
      id: s.name,
      name: s.name,
      description: s.description ?? s.title ?? "",
      created_at: meta?.publishedAt ?? new Date().toISOString(),
      updated_at: meta?.updatedAt ?? new Date().toISOString(),
      version_detail: s.version
        ? { version: s.version, release_date: meta?.updatedAt, is_latest: meta?.isLatest ?? true }
        : undefined,
      packages: s.packages,
      repository: s.repository,
      remotes: s.remotes,
      websiteUrl: s.websiteUrl,
    };
    return { ...server, category: deriveCategory(server) };
  } catch {
    return null;
  }
}

async function clientFetchServers(): Promise<MCPServer[]> {
  const all: MCPServer[] = [];
  let cursor: string | undefined;
  let pages = 0;
  do {
    const params = new URLSearchParams({ limit: "100" });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(`/api/servers?${params}`);
    if (!res.ok) break;
    const raw = await res.json();
    const items: MCPServerListItem[] = raw.servers ?? [];
    const normalised = items
      .filter((item) => item && typeof item === "object" && "server" in item)
      .map(normaliseItem)
      .filter((s): s is MCPServer => s !== null);
    all.push(...normalised);
    // Bug 2 fix: metadata.nextCursor not next_cursor
    cursor = raw.metadata?.nextCursor ?? raw.next_cursor;
    pages++;
  } while (cursor && pages < 5);
  return all;
}

export function ServerGrid({
  initialServers,
  categories: initialCategories,
  packageTypes: initialPackageTypes,
}: ServerGridProps) {
  const [servers, setServers] = useState<MCPServer[]>(initialServers);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [packageTypes, setPackageTypes] = useState<string[]>(initialPackageTypes);
  const [loading, setLoading] = useState(initialServers.length === 0);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Belt-and-suspenders: if SSR returned 0 servers, fetch client-side
  useEffect(() => {
    if (initialServers.length > 0) return;
    let cancelled = false;
    clientFetchServers()
      .then((fetched) => {
        if (cancelled || fetched.length === 0) { setLoading(false); return; }
        setServers(fetched);
        setCategories(
          Array.from(new Set(fetched.map((s) => s.category ?? "General"))).sort()
        );
        setPackageTypes(
          Array.from(
            new Set(fetched.flatMap((s) => s.packages?.map((p) => pkgType(p)) ?? []))
          )
            .filter(Boolean)
            .sort()
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [initialServers.length]);

  const filtered = useMemo(() => {
    let list = servers;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name ?? "").toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q)
      );
    }
    if (selectedCategory) list = list.filter((s) => s.category === selectedCategory);
    if (selectedPkg)
      list = list.filter((s) =>
        s.packages?.some((p) => pkgType(p) === selectedPkg.toLowerCase())
      );
    return list;
  }, [servers, query, selectedCategory, selectedPkg]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paginated.length < filtered.length;
  const clearFilters = useCallback(() => {
    setQuery(""); setSelectedCategory(null); setSelectedPkg(null); setPage(1);
  }, []);
  const activeFilterCount =
    (query ? 1 : 0) + (selectedCategory ? 1 : 0) + (selectedPkg ? 1 : 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading MCP servers…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search MCP servers…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors",
              showFilters || activeFilterCount > 0
                ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="glass rounded-xl p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">
                <Filter className="w-3 h-3 inline mr-1" />Category
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setPage(1); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      selectedCategory === cat
                        ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    {CATEGORY_ICONS[cat] ?? "📦"} {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">
                Package Registry
              </p>
              <div className="flex flex-wrap gap-2">
                {packageTypes.map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => { setSelectedPkg(selectedPkg === pkg ? null : pkg); setPage(1); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      selectedPkg === pkg
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {filtered.length === servers.length
            ? `${servers.length} servers`
            : `${filtered.length} of ${servers.length} servers`}
        </p>
        {query && (
          <p className="text-xs text-slate-600">
            Showing results for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-slate-400 text-lg">No servers found</p>
          <p className="text-slate-600 text-sm mt-2">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg bg-brand-500/10 text-brand-300 text-sm hover:bg-brand-500/20 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((server) => (
              <ServerCard key={server.id} server={server} onClick={() => setSelectedServer(server)} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/8 hover:text-white transition-colors"
              >
                Load more ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {selectedServer && (
        <ServerDetailModal server={selectedServer} onClose={() => setSelectedServer(null)} />
      )}
    </div>
  );
}
