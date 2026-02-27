"use client";

import { useState, useEffect } from "react";
import type { MCPServer, MCPServerListItem } from "@/types/mcp";

interface StatsBarProps {
  servers: MCPServer[];
}

function pkgType(p: { registryType?: string; registry_name?: string }): string {
  const t = (p.registryType ?? p.registry_name ?? "").toLowerCase();
  return t === "oci" ? "docker" : t;
}

function normaliseRaw(item: MCPServerListItem): MCPServer | null {
  try {
    const s = item.server;
    if (!s?.name) return null;
    return {
      id: s.name,
      name: s.name,
      description: s.description ?? "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      packages: s.packages,
    };
  } catch {
    return null;
  }
}

export function StatsBar({ servers: initialServers }: StatsBarProps) {
  const [servers, setServers] = useState<MCPServer[]>(initialServers);

  // If SSR gave us 0 servers, fetch client-side for stats
  useEffect(() => {
    if (initialServers.length > 0) return;
    fetch("/api/servers?limit=100")
      .then((r) => r.json())
      .then((raw) => {
        const items: MCPServerListItem[] = raw.servers ?? [];
        const normalised = items
          .filter((i) => i && "server" in i)
          .map(normaliseRaw)
          .filter((s): s is MCPServer => s !== null);
        if (normalised.length > 0) setServers(normalised);
      })
      .catch(() => {});
  }, [initialServers.length]);

  const npmCount = servers.filter((s) =>
    s.packages?.some((p) => pkgType(p) === "npm")
  ).length;
  const pypiCount = servers.filter((s) =>
    s.packages?.some((p) => pkgType(p) === "pypi")
  ).length;
  const dockerCount = servers.filter((s) =>
    s.packages?.some((p) => pkgType(p) === "docker")
  ).length;

  const stats = [
    { label: "Total Servers", value: servers.length.toLocaleString() },
    { label: "npm packages", value: npmCount.toLocaleString() },
    { label: "PyPI packages", value: pypiCount.toLocaleString() },
    { label: "Docker images", value: dockerCount.toLocaleString() },
  ];

  return (
    <div className="border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
