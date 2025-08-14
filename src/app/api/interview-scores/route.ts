import { NextResponse } from "next/server";

// Proxy to generic category-scores handler for best-in-interview
export async function GET(req: Request) {
  const url = new URL("/api/category-scores", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
  url.searchParams.set("category", "best-in-interview");
  const res = await fetch(url.toString(), { headers: req.headers });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
