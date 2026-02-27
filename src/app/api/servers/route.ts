import { NextRequest, NextResponse } from "next/server";

const REGISTRY_BASE = "https://registry.modelcontextprotocol.io";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = searchParams.get("limit") ?? "100";
  const q = searchParams.get("q");

  const url = new URL(`${REGISTRY_BASE}/v0/servers`);
  if (cursor) url.searchParams.set("cursor", cursor);
  if (limit) url.searchParams.set("limit", limit);
  if (q) url.searchParams.set("q", q);

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "mcp-hub/1.0 (https://mcp-hub-one.vercel.app)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Registry fetch failed: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch registry", details: String(err) },
      { status: 500 }
    );
  }
}
