import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const name = searchParams.get("name") || "Resume.pdf";

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Unable to fetch file" }, { status: 502 });
    }

    const headers = new Headers(upstream.headers);
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${name}"`);
    headers.delete("content-security-policy");

    return new Response(upstream.body, { headers, status: 200 });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}


