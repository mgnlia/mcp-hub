"use client";

import Link from "next/link";
import { Github, Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0b0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-brand-500/30 transition-shadow">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white text-lg tracking-tight">
              MCP <span className="gradient-text">Hub</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/playground"
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Playground
            </Link>
            <Link
              href="/compose"
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              Compose
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/mgnlia/mcp-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://registry.modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-md hover:bg-brand-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              Registry Live
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
