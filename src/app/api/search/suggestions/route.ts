import { NextResponse } from "next/server"

import { searchSuggestions } from "@/lib/queries/search"

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? ""
  if (q.trim().length < 2) return NextResponse.json([])
  const items = await searchSuggestions(q.trim(), 8)
  return NextResponse.json(items)
}
