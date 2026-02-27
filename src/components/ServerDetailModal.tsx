"use client";

import { useState } from "react";
import {
  X, ExternalLink, Copy, Check, Play, Package,
  GitBranch, Clock, Tag, ChevronRight
} from "lucide-react";
import type { MCPServer, MCPPackage } from "@/types/mcp";
import { cn, timeAgo, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import { getPackageInstallCmd, getRepoUrl } from "@/lib/registry";
import { PlaygroundPanel } from "./PlaygroundPanel";

interface ServerDetailModalProps {
  server: MCPServer;
  onClose: () => void;
}

type Tab = "overview" | "install" | "playground";

// Helper: normalise package fields across old and new API schema
function normalisePkg(pkg: MCPPackage): {
  type: string;
  name: string;
  version?: string;
  envVars: MCPPackage["environmentVariables"];
} {
  const type = (pkg.registryType ?? pkg.registry_name ?? "").toLowerCase();
  const name = pkg.identifier ?? pkg.name ?? "";
  const version = pkg.version;
  const envVars = pkg.environmentVariables ?? pkg.environment_variables ?? [];
  return { type, name, version, envVars };
}

export function ServerDetailModal({ server, onClose }: ServerDetailModalProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState<string | null>(null);

  const category = server.category ?? "General";
  const catColor = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["General"];
  const catIcon = CATEGORY_ICONS[category] ?? "📦";
  const repoUrl = getRepoUrl(server);
  const installCmd = getPackageInstallCmd(server);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const shortName = server.name.split("/").pop() ?? server.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col glass rounded-2xl border border-white/10 shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", catColor)}>
                {catIcon} {category}
              </span>
              {server.version_detail?.version && (
                <span className="text-xs text-slate-600 font-mono">
                  v{server.version_detail.version}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white truncate">{shortName}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{server.name}</p>
          </div>

          <div className="flex items-center gap-2">
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          {(["overview", "install", "playground"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors -mb-px",
                tab === t
                  ? "border-brand-500 text-brand-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              )}
            >
              {t === "playground" && <Play className="w-3 h-3 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "overview" && (
            <div className="space-y-5">
              {/* Description */}
              <div>
                <p className="text-slate-300 leading-relaxed">{server.description || "No description provided."}</p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock, label: "Updated", value: timeAgo(server.updated_at) },
                  { icon: Clock, label: "Created", value: timeAgo(server.created_at) },
                  { icon: Tag, label: "Version", value: server.version_detail?.version ?? "unknown" },
                  {
                    icon: GitBranch,
                    label: "Source",
                    value: server.repository?.source ?? "unknown",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-white/3 rounded-lg p-3">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
                      <p className="text-sm text-slate-300 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Packages */}
              {server.packages && server.packages.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Packages
                  </h3>
                  <div className="space-y-2">
                    {server.packages.map((pkg, i) => {
                      const { type, name, version } = normalisePkg(pkg);
                      return (
                        <div key={i} className="flex items-center justify-between bg-white/3 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-slate-500" />
                            <div>
                              <p className="text-sm text-white font-mono truncate max-w-xs">{name || "—"}</p>
                              <p className="text-[10px] text-slate-600">{type || "unknown"}</p>
                            </div>
                          </div>
                          {version && (
                            <span className="text-xs text-slate-500 font-mono">v{version}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Environment variables — support both old and new schema */}
              {server.packages?.some((p) => {
                const { envVars } = normalisePkg(p);
                return envVars && envVars.length > 0;
              }) && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Environment Variables
                  </h3>
                  <div className="space-y-2">
                    {server.packages.flatMap((p) => normalisePkg(p).envVars ?? []).map((env, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/3 rounded-lg p-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-emerald-400 font-mono">{env.name}</code>
                            {env.is_required && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                required
                              </span>
                            )}
                            {(env.isSecret || env.is_secret) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                secret
                              </span>
                            )}
                          </div>
                          {env.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{env.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "install" && (
            <div className="space-y-5">
              <p className="text-slate-400 text-sm">
                Choose your preferred runtime to install and run this MCP server.
              </p>

              {server.packages?.map((pkg, i) => {
                const { type, name } = normalisePkg(pkg);
                if (!name) return null;

                let cmd = "";
                let label = "";
                let configJson = "";

                if (type === "npm") {
                  cmd = `npx ${name}`;
                  label = "Node.js / npx";
                  configJson = JSON.stringify({
                    mcpServers: {
                      [shortName]: {
                        command: "npx",
                        args: ["-y", name],
                      },
                    },
                  }, null, 2);
                } else if (type === "pypi") {
                  cmd = `uvx ${name}`;
                  label = "Python / uvx";
                  configJson = JSON.stringify({
                    mcpServers: {
                      [shortName]: {
                        command: "uvx",
                        args: [name],
                      },
                    },
                  }, null, 2);
                } else if (type === "docker" || type === "oci") {
                  cmd = `docker run -i --rm ${name}`;
                  label = "Docker / OCI";
                  configJson = JSON.stringify({
                    mcpServers: {
                      [shortName]: {
                        command: "docker",
                        args: ["run", "-i", "--rm", name],
                      },
                    },
                  }, null, 2);
                } else {
                  return null;
                }

                return (
                  <div key={i} className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-brand-400" />
                      {label}
                    </h3>

                    {/* Run command */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1.5">Run command</p>
                      <div className="flex items-center gap-2 bg-black/40 rounded-lg px-4 py-3 border border-white/5">
                        <code className="flex-1 text-sm text-emerald-400 font-mono">{cmd}</code>
                        <button
                          onClick={() => copyToClipboard(cmd, `cmd-${i}`)}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          {copied === `cmd-${i}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Claude config */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1.5">Claude Desktop / claude_desktop_config.json</p>
                      <div className="relative bg-black/40 rounded-lg p-4 border border-white/5">
                        <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                          {configJson}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(configJson, `config-${i}`)}
                          className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
                        >
                          {copied === `config-${i}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!installCmd && (
                <p className="text-slate-500 text-sm">
                  No standard install method available. Check the{" "}
                  {repoUrl && (
                    <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                      repository
                    </a>
                  )}{" "}
                  for manual installation instructions.
                </p>
              )}
            </div>
          )}

          {tab === "playground" && (
            <PlaygroundPanel server={server} />
          )}
        </div>
      </div>
    </div>
  );
}
