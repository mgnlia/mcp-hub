"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { MCPServer } from "@/types/mcp";
import { PlaygroundPanel } from "./PlaygroundPanel";
import { CATEGORY_ICONS } from "@/lib/utils";

interface PlaygroundPageClientProps {
  servers: MCPServer[];
}

export function PlaygroundPageClient({ servers }: PlaygroundPageClientProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MCPServer | null>(servers[0] ?? null);

  const filtered = query
    ? servers.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase())
      )
    : servers;

  const shortName = (s: MCPServer) => s.name.split("/").pop() ?? s.name;

  return (
    <div className="flex gap-6 h-[calc(100vh-220px)]">
      {/* Server list */}
      <div className="w-72 flex-shrink-0 flex flex-col glass rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search servers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/5 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/40"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((server) => (
            <button
              key={server.id}
              onClick={() => setSelected(server)}
              className={`w-full text-left px-4 py-3 border-b border-white/3 transition-colors hover:bg-white/3 ${
                selected?.id === server.id ? "bg-brand-500/10 border-l-2 border-l-brand-500" : ""
              }`}
            >
              <p className="text-xs font-medium text-white truncate">
                {CATEGORY_ICONS[server.category ?? "General"]} {shortName(server)}
              </p>
              <p className="text-[10px] text-slate-600 truncate mt-0.5">{server.description}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-slate-600 text-xs py-8">No servers found</p>
          )}
        </div>
      </div>

      {/* Playground */}
      <div className="flex-1 glass rounded-2xl overflow-y-auto p-6">
        {selected ? (
          <>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white">{shortName(selected)}</h2>
              <p className="text-sm text-slate-400 mt-1">{selected.description}</p>
            </div>
            <PlaygroundPanel server={selected} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600">
            Select a server from the list to start testing
          </div>
        )}
      </div>
    </div>
  );
}
