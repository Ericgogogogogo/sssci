import { NextResponse } from "next/server";
import { exportPaperToHTML } from "@/lib/export/paper-html";

export async function POST(req: Request) {
  const { paper, title } = await req.json().catch(() => ({}));
  const html = exportPaperToHTML(paper, { title });
  return new NextResponse(html, { headers: { "Content-Type": "text/html", "Content-Disposition": `attachment; filename=${(title || paper?.title || "Paper")}.html` } });
}