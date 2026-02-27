"use client";

import { ExternalLink, Package, Play, GitBranch } from "lucide-react";
import type { MCPServer } from "@/types/mcp";
import { cn, truncate, timeAgo, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import { getPackageInstallCmd } from "@/lib/registry";

interface ServerCardProps {
  server: MCPServer;
  onClick: () => void;
}

const PKG_BADGE: Record<string, { label: string; color: string }> = {
  npm:    { label: "npm",    color: "bg-red-500/10 text-red-400 border-red-500/20" },
  pypi:   { label: "PyPI",   color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  docker: { label: "Docker", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  github: { label: "GitHub", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

function shortName(fullName: string): string {
  // io.github.org/server-name → server-name
  const parts = fullName.split("/");
  return parts[parts.length - 1] ?? fullName;
}

function orgName(fullName: string): string {
  // io.github.org/server-name → org
  const dotParts = fullName.split(".");
  const slashIdx = fullName.indexOf("/");
  if (slashIdx > 0) {
    const prefix = fullName.slice(0, slashIdx);
    const prefixParts = prefix.split(".");
    return prefixParts[prefixParts.length - 1] ?? "";
  }
  return dotParts[dotParts.length - 1] ?? "";
}

export function ServerCard({ server, onClick }: ServerCardProps) {
  const category = server.category ?? "General";
  const catColor = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["General"];
  const catIcon = CATEGORY_ICONS[category] ?? "📦";
  const installCmd = getPackageInstallCmd(server);
  const pkgTypes = Array.from(new Set(server.packages?.map((p) => p.registry_name) ?? []));
  const displayName = shortName(server.name);
  const org = orgName(server.name);

  return (
    <div
      onClick={onClick}
      className="group relative glass rounded-2xl p-5 cursor-pointer hover:bg-white/[0.05] hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm truncate group-hover:text-brand-300 transition-colors">
              {displayName}
            </h3>
          </div>
          {org && (
            <p className="text-xs text-slate-600 truncate">
              {org}
            </p>
          )}
        </div>

        <span
          className={cn(
            "ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium",
            catColor
          )}
        >
          {catIcon} {category}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
        {truncate(server.description || "No description provided.", 120)}
      </p>

      {/* Install command */}
      {installCmd && (
        <div className="mb-4 flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
          <Package className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <code className="text-xs text-emerald-400 font-mono truncate">{installCmd}</code>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {pkgTypes.map((pkg) => {
            const badge = PKG_BADGE[pkg];
            if (!badge) return null;
            return (
              <span
                key={pkg}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded border font-medium",
                  badge.color
                )}
              >
                {badge.label}
              </span>
            );
          })}
          {server.version_detail?.version && (
            <span className="text-[10px] text-slate-600 font-mono">
              v{server.version_detail.version}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          {server.repository?.url && (
            <a
              href={server.repository.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-slate-300 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
            </a>
          )}
          <span className="text-[10px]">{timeAgo(server.updated_at)}</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Hover play hint */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 text-[10px] text-brand-400">
          <Play className="w-3 h-3" />
          <span>Test</span>
        </div>
      </div>
    </div>
  );
}
