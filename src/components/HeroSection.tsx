"use client";

import { Zap, Search, Play, Share2 } from "lucide-react";

interface HeroSectionProps {
  totalServers: number;
}

export function HeroSection({ totalServers }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/10 rounded-full blur-[80px]" />
        <div className="absolute top-10 left-1/3 w-[300px] h-[200px] bg-purple-600/8 rounded-full blur-[60px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6">
          <Zap className="w-3 h-3" />
          {totalServers > 0 ? `${totalServers}+ servers` : "Live registry"} · Updated every 5 min
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
          The Universal{" "}
          <span className="gradient-text">MCP Registry</span>
          <br />& Playground
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover, test, and compose{" "}
          <span className="text-slate-300">Model Context Protocol</span> servers in one place.
          Browse the official registry, run tools live, and share configurations instantly.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { icon: Search, label: "Browse 1000+ servers" },
            { icon: Play, label: "One-click tool testing" },
            { icon: Share2, label: "Share as URL" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-slate-300"
            >
              <Icon className="w-3.5 h-3.5 text-brand-400" />
              {label}
            </div>
          ))}
        </div>

        {/* Protocol info */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Powered by</span>
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Model Context Protocol
          </a>
          <span>·</span>
          <span>By Anthropic</span>
        </div>
      </div>
    </section>
  );
}
