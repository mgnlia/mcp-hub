"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Check, Share2, Download, Search } from "lucide-react";
import type { MCPServer } from "@/types/mcp";
import { cn, encodeShareUrl, CATEGORY_ICONS } from "@/lib/utils";

interface ComposeClientProps {
  servers: MCPServer[];
}

interface SelectedServer {
  server: MCPServer;
  envVars: Record<string, string>;
}

export function ComposeClient({ servers }: ComposeClientProps) {
  const [selected, setSelected] = useState<SelectedServer[]>([]);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const filtered = query
    ? servers.filter(
        (s) =>
          !selected.find((sel) => sel.server.id === s.id) &&
          (s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.description.toLowerCase().includes(query.toLowerCase()))
      )
    : servers.filter((s) => !selected.find((sel) => sel.server.id === s.id)).slice(0, 20);

  const addServer = (server: MCPServer) => {
    const envVars: Record<string, string> = {};
    server.packages?.forEach((pkg) => {
      pkg.environment_variables?.forEach((env) => {
        envVars[env.name] = "";
      });
    });
    setSelected((prev) => [...prev, { server, envVars }]);
    setQuery("");
  };

  const removeServer = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.server.id !== id));
  };

  const updateEnvVar = (serverId: string, key: string, value: string) => {
    setSelected((prev) =>
      prev.map((s) =>
        s.server.id === serverId
          ? { ...s, envVars: { ...s.envVars, [key]: value } }
          : s
      )
    );
  };

  const buildConfig = () => {
    const mcpServers: Record<string, unknown> = {};

    selected.forEach(({ server, envVars }) => {
      const pkg = server.packages?.[0];
      const shortName = server.name.split("/").pop() ?? server.name;

      if (!pkg) return;

      let entry: Record<string, unknown> = {};

      if (pkg.registry_name === "npm") {
        entry = { command: "npx", args: ["-y", pkg.name] };
      } else if (pkg.registry_name === "pypi") {
        entry = { command: "uvx", args: [pkg.name] };
      } else if (pkg.registry_name === "docker") {
        entry = { command: "docker", args: ["run", "-i", "--rm", pkg.name] };
      }

      const nonEmptyEnvVars = Object.fromEntries(
        Object.entries(envVars).filter(([, v]) => v.trim() !== "")
      );
      if (Object.keys(nonEmptyEnvVars).length > 0) {
        entry.env = nonEmptyEnvVars;
      }

      mcpServers[shortName] = entry;
    });

    return { mcpServers };
  };

  const configJson = JSON.stringify(buildConfig(), null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(configJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const config = {
      compose: selected.map((s) => ({ id: s.server.id, env: s.envVars })),
    };
    const encoded = encodeShareUrl(config);
    const url = `${window.location.origin}/compose?share=${encoded}`;
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claude_desktop_config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Server picker + selected */}
      <div className="space-y-4">
        {/* Search to add */}
        <div className="glass rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Add Servers
          </p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search and add MCP servers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/5 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/40"
            />
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.map((server) => {
              const shortName = server.name.split("/").pop() ?? server.name;
              return (
                <button
                  key={server.id}
                  onClick={() => addServer(server)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors group"
                >
                  <span className="text-base">{CATEGORY_ICONS[server.category ?? "General"]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">{shortName}</p>
                    <p className="text-[10px] text-slate-600 truncate">{server.description}</p>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors" />
                </button>
              );
            })}
            {filtered.length === 0 && query && (
              <p className="text-center text-slate-600 text-xs py-4">No matching servers</p>
            )}
          </div>
        </div>

        {/* Selected servers */}
        {selected.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selected.length} Server{selected.length !== 1 ? "s" : ""} Selected
            </p>
            {selected.map(({ server, envVars }) => {
              const shortName = server.name.split("/").pop() ?? server.name;
              const envKeys = Object.keys(envVars);
              return (
                <div key={server.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[server.category ?? "General"]}</span>
                      <p className="text-sm font-semibold text-white">{shortName}</p>
                    </div>
                    <button
                      onClick={() => removeServer(server.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {envKeys.length > 0 && (
                    <div className="space-y-2">
                      {envKeys.map((key) => (
                        <div key={key}>
                          <label className="text-[10px] text-slate-500 font-mono block mb-1">{key}</label>
                          <input
                            type="text"
                            placeholder="Enter value…"
                            value={envVars[key]}
                            onChange={(e) => updateEnvVar(server.id, key, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-black/20 border border-white/5 rounded-md text-xs text-white placeholder-slate-700 font-mono focus:outline-none focus:border-brand-500/30"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selected.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <p className="text-3xl mb-3">🔧</p>
            <p className="text-sm">Search above to add MCP servers</p>
          </div>
        )}
      </div>

      {/* Right: Config output */}
      <div className="space-y-4">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-slate-400">
              claude_desktop_config.json
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {shared ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                {shared ? "Copied!" : "Share URL"}
              </button>
              <button
                onClick={handleDownload}
                disabled={selected.length === 0}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                  selected.length > 0
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 cursor-not-allowed"
                )}
              >
                <Download className="w-3 h-3" />
                Download
              </button>
              <button
                onClick={handleCopy}
                disabled={selected.length === 0}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                  selected.length > 0
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 cursor-not-allowed"
                )}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            {selected.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-700 text-sm">
                Add servers to generate config
              </div>
            ) : (
              <pre className="json-output text-slate-300 whitespace-pre-wrap">
                {configJson}
              </pre>
            )}
          </div>
        </div>

        {/* Usage hint */}
        <div className="glass rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            How to use
          </p>
          <ol className="space-y-1.5 text-xs text-slate-500">
            <li>1. Add the servers you want to use</li>
            <li>2. Fill in any required environment variables</li>
            <li>3. Copy or download the config</li>
            <li>4. Paste into your Claude Desktop config file</li>
          </ol>
          <p className="text-[10px] text-slate-700 mt-3">
            Config path: <code className="text-slate-600">~/Library/Application Support/Claude/claude_desktop_config.json</code>
          </p>
        </div>
      </div>
    </div>
  );
}
