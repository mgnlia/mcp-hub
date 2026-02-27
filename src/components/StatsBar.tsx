"use client";

import type { MCPServer } from "@/types/mcp";

interface StatsBarProps {
  servers: MCPServer[];
}

export function StatsBar({ servers }: StatsBarProps) {
  const npmCount = servers.filter((s) =>
    s.packages?.some((p) => p.registry_name === "npm")
  ).length;
  const pypiCount = servers.filter((s) =>
    s.packages?.some((p) => p.registry_name === "pypi")
  ).length;
  const dockerCount = servers.filter((s) =>
    s.packages?.some((p) => p.registry_name === "docker")
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
