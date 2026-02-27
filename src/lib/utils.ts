import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function encodeShareUrl(config: Record<string, unknown>): string {
  const json = JSON.stringify(config);
  const b64 = Buffer.from(json).toString("base64url");
  return b64;
}

export function decodeShareUrl(b64: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(b64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Dev Tools":    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Database":     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Web & Search": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Files & Storage": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Productivity": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Cloud & Infra":"bg-sky-500/10 text-sky-400 border-sky-500/20",
  "AI & ML":      "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Finance":      "bg-green-500/10 text-green-400 border-green-500/20",
  "Data & APIs":  "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Memory":       "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "General":      "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Dev Tools":    "🛠️",
  "Database":     "🗄️",
  "Web & Search": "🌐",
  "Files & Storage": "📁",
  "Productivity": "⚡",
  "Cloud & Infra":"☁️",
  "AI & ML":      "🤖",
  "Finance":      "💰",
  "Data & APIs":  "📡",
  "Memory":       "🧠",
  "General":      "📦",
};
