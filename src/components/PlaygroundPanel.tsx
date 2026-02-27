"use client";

import { useState } from "react";
import { Play, Share2, Check, AlertCircle, Loader2 } from "lucide-react";
import type { MCPServer } from "@/types/mcp";
import { cn, encodeShareUrl } from "@/lib/utils";
import { getPackageInstallCmd } from "@/lib/registry";

interface PlaygroundPanelProps {
  server: MCPServer;
}

type SimulatedTool = {
  name: string;
  description: string;
  inputSchema: Record<string, { type: string; description: string; required?: boolean }>;
};

// Derive plausible mock tools from server metadata
function deriveMockTools(server: MCPServer): SimulatedTool[] {
  const name = server.name.toLowerCase();
  const desc = server.description.toLowerCase();

  if (/github/.test(name)) {
    return [
      {
        name: "list_repos",
        description: "List repositories for a GitHub user or organization",
        inputSchema: {
          owner: { type: "string", description: "GitHub username or org", required: true },
          type: { type: "string", description: "all | owner | member (default: all)" },
        },
      },
      {
        name: "create_issue",
        description: "Create a new issue in a repository",
        inputSchema: {
          owner: { type: "string", description: "Repository owner", required: true },
          repo: { type: "string", description: "Repository name", required: true },
          title: { type: "string", description: "Issue title", required: true },
          body: { type: "string", description: "Issue body (markdown)" },
        },
      },
    ];
  }

  if (/filesystem|file/.test(name + desc)) {
    return [
      {
        name: "read_file",
        description: "Read the complete contents of a file",
        inputSchema: {
          path: { type: "string", description: "Absolute path to the file", required: true },
        },
      },
      {
        name: "list_directory",
        description: "List the contents of a directory",
        inputSchema: {
          path: { type: "string", description: "Path to the directory", required: true },
        },
      },
    ];
  }

  if (/fetch|web|search|crawl/.test(name + desc)) {
    return [
      {
        name: "fetch",
        description: "Fetch a URL and return its content",
        inputSchema: {
          url: { type: "string", description: "URL to fetch", required: true },
          max_length: { type: "string", description: "Max response length (default: 5000)" },
        },
      },
    ];
  }

  if (/memory|knowledge|graph/.test(name + desc)) {
    return [
      {
        name: "store_memory",
        description: "Store a key-value memory for later retrieval",
        inputSchema: {
          key: { type: "string", description: "Memory key", required: true },
          value: { type: "string", description: "Value to store", required: true },
        },
      },
      {
        name: "search_memory",
        description: "Search stored memories by query",
        inputSchema: {
          query: { type: "string", description: "Search query", required: true },
        },
      },
    ];
  }

  if (/database|postgres|sql|sqlite|mongo/.test(name + desc)) {
    return [
      {
        name: "query",
        description: "Execute a read-only SQL query",
        inputSchema: {
          sql: { type: "string", description: "SQL query to execute", required: true },
        },
      },
      {
        name: "list_tables",
        description: "List all tables in the database",
        inputSchema: {},
      },
    ];
  }

  // Generic fallback
  return [
    {
      name: "ping",
      description: "Test connectivity to the MCP server",
      inputSchema: {
        message: { type: "string", description: "Optional test message" },
      },
    },
    {
      name: "get_info",
      description: "Get server information and capabilities",
      inputSchema: {},
    },
  ];
}

function simulateResponse(tool: SimulatedTool, inputs: Record<string, string>): unknown {
  // Produce plausible mock responses
  switch (tool.name) {
    case "list_repos":
      return {
        repositories: [
          { name: "example-repo", private: false, stars: 42, language: "TypeScript" },
          { name: "another-project", private: true, stars: 0, language: "Python" },
        ],
        total: 2,
      };
    case "create_issue":
      return {
        id: Math.floor(Math.random() * 9000) + 1000,
        title: inputs.title || "New Issue",
        url: `https://github.com/${inputs.owner || "owner"}/${inputs.repo || "repo"}/issues/1`,
        state: "open",
        created_at: new Date().toISOString(),
      };
    case "read_file":
      return {
        content: `// Contents of ${inputs.path || "file.ts"}\nexport const hello = "world";\n`,
        size: 48,
        encoding: "utf-8",
      };
    case "list_directory":
      return {
        entries: [
          { name: "src", type: "directory" },
          { name: "package.json", type: "file", size: 1024 },
          { name: "README.md", type: "file", size: 2048 },
        ],
      };
    case "fetch":
      return {
        url: inputs.url || "https://example.com",
        status: 200,
        content: "# Example Page\nThis is the fetched content of the page.",
        content_type: "text/html",
      };
    case "store_memory":
      return { success: true, key: inputs.key, stored_at: new Date().toISOString() };
    case "search_memory":
      return {
        results: [
          { key: "user_preference", value: "dark mode", relevance: 0.92 },
          { key: "last_project", value: inputs.query, relevance: 0.78 },
        ],
      };
    case "query":
      return {
        rows: [
          { id: 1, name: "Alice", email: "alice@example.com" },
          { id: 2, name: "Bob", email: "bob@example.com" },
        ],
        row_count: 2,
        execution_time_ms: 3.2,
      };
    case "list_tables":
      return { tables: ["users", "posts", "comments", "sessions"] };
    case "ping":
      return { pong: true, message: inputs.message || "Hello from MCP!", latency_ms: 12 };
    case "get_info":
      return {
        name: "MCP Server",
        version: "1.0.0",
        capabilities: ["tools", "resources", "prompts"],
      };
    default:
      return { result: "ok", timestamp: new Date().toISOString() };
  }
}

export function PlaygroundPanel({ server }: PlaygroundPanelProps) {
  const tools = deriveMockTools(server);
  const [selectedTool, setSelectedTool] = useState<SimulatedTool>(tools[0]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const res = simulateResponse(selectedTool, inputs);
    setResult(res);
    setLoading(false);
  };

  const handleShare = async () => {
    const config = {
      server: server.id,
      tool: selectedTool.name,
      inputs,
    };
    const encoded = encodeShareUrl(config);
    const url = `${window.location.origin}?share=${encoded}`;
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const installCmd = getPackageInstallCmd(server);

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          <span className="font-semibold">Simulated playground.</span> Responses are realistic mock
          data. To run live, install the server locally:
          {installCmd && (
            <code className="ml-1 font-mono text-emerald-400">{installCmd}</code>
          )}
        </p>
      </div>

      {/* Tool selector */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Select Tool
        </p>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => { setSelectedTool(tool); setInputs({}); setResult(null); }}
              className={cn(
                "text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                selectedTool.name === tool.name
                  ? "bg-brand-500/15 border-brand-500/30 text-brand-300"
                  : "bg-white/3 border-white/8 text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <p className="font-mono font-medium text-xs">{tool.name}</p>
              <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{tool.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tool description */}
      <div className="bg-white/3 rounded-lg p-3">
        <p className="text-xs text-slate-400">{selectedTool.description}</p>
      </div>

      {/* Inputs */}
      {Object.keys(selectedTool.inputSchema).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Input Parameters
          </p>
          <div className="space-y-2.5">
            {Object.entries(selectedTool.inputSchema).map(([key, schema]) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <code className="text-emerald-400 font-mono">{key}</code>
                  {schema.required && (
                    <span className="text-[10px] text-red-400">required</span>
                  )}
                  <span className="text-slate-600">— {schema.description}</span>
                </label>
                <input
                  type="text"
                  placeholder={schema.type}
                  value={inputs[key] ?? ""}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-white/8 rounded-lg text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-brand-500/40 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run button */}
      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Tool
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 text-sm transition-colors"
        >
          {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          {shared ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Result */}
      {result !== null && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Response
          </p>
          <div className="bg-black/40 rounded-xl border border-emerald-500/10 p-4">
            <pre className="json-output text-emerald-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
