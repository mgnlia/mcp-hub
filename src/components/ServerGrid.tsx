"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import type { MCPServer } from "@/types/mcp";
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

export function ServerGrid({ initialServers, categories, packageTypes }: ServerGridProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = initialServers;

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name ?? "").toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((s) => s.category === selectedCategory);
    }

    if (selectedPkg) {
      list = list.filter((s) =>
        s.packages?.some((p) => p.registry_name === selectedPkg)
      );
    }

    return list;
  }, [initialServers, query, selectedCategory, selectedPkg]);

  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  );

  const hasMore = paginated.length < filtered.length;

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedCategory(null);
    setSelectedPkg(null);
    setPage(1);
  }, []);

  const activeFilterCount =
    (query ? 1 : 0) + (selectedCategory ? 1 : 0) + (selectedPkg ? 1 : 0);

  return (
    <div>
      {/* Search + filter bar */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search MCP servers…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:bg-white/7 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8"
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
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="glass rounded-xl p-4 space-y-4 animate-fade-in">
            {/* Categories */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">
                <Filter className="w-3 h-3 inline mr-1" />
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat ? null : cat);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      selectedCategory === cat
                        ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8"
                    )}
                  >
                    {CATEGORY_ICONS[cat] ?? "📦"} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Package type */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">
                Package Registry
              </p>
              <div className="flex flex-wrap gap-2">
                {packageTypes.map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => {
                      setSelectedPkg(selectedPkg === pkg ? null : pkg);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      selectedPkg === pkg
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8"
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

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {filtered.length === initialServers.length
            ? `${initialServers.length} servers`
            : `${filtered.length} of ${initialServers.length} servers`}
        </p>
        {query && (
          <p className="text-xs text-slate-600">
            Showing results for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Grid */}
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
              <ServerCard
                key={server.id}
                server={server}
                onClick={() => setSelectedServer(server)}
              />
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

      {/* Detail modal */}
      {selectedServer && (
        <ServerDetailModal
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
        />
      )}
    </div>
  );
}
