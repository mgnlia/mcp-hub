import { Navbar } from "@/components/Navbar";
import { fetchServers, deriveCategory } from "@/lib/registry";
import { PlaygroundPageClient } from "@/components/PlaygroundPageClient";
import type { MCPServer } from "@/types/mcp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Playground — MCP Hub",
  description: "Test any MCP server tool with mock inputs in the browser.",
};

export default async function PlaygroundPage() {
  let servers: MCPServer[] = [];
  try {
    const page = await fetchServers({ limit: 100 });
    servers = (page.servers ?? [])
      .filter((s) => s && s.id)
      .map((s) => ({ ...s, category: deriveCategory(s) }));
  } catch {
    servers = [];
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎮 MCP Playground
          </h1>
          <p className="text-slate-400">
            Select any MCP server and test its tools with mock inputs — no installation required.
          </p>
        </div>
        <PlaygroundPageClient servers={servers} />
      </div>
    </div>
  );
}
