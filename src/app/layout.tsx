import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCP Hub — Discover, Test & Compose MCP Servers",
  description:
    "The universal registry and playground for Model Context Protocol servers. Browse 1000+ MCP servers, test tools live, and compose multi-server workflows.",
  keywords: ["MCP", "Model Context Protocol", "AI tools", "LLM", "Anthropic", "Claude"],
  openGraph: {
    title: "MCP Hub",
    description: "Discover, test, and compose MCP servers in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#0a0b0f]`}
      >
        {children}
      </body>
    </html>
  );
}
