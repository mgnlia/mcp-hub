import { Navbar } from "@/components/Navbar";
import { ComposeClient } from "@/components/ComposeClient";
import { fetchServers, deriveCategory } from "@/lib/registry";

export const metadata = {
  title: "Compose — MCP Hub",
  description: "Build and share multi-server MCP configurations.",
};

export default async function ComposePage() {
  let servers;
  try {
    const page = await fetchServers({ limit: 100 });
    servers = page.servers.map((s) => ({ ...s, category: deriveCategory(s) }));
  } catch {
    servers = [];
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔧 MCP Composer
          </h1>
          <p className="text-slate-400">
            Build a multi-server MCP configuration, then export it or share via URL.
          </p>
        </div>
        <ComposeClient servers={servers} />
      </div>
    </div>
  );
}
