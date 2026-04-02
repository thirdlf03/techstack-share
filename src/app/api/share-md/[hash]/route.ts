import { NextRequest, NextResponse } from "next/server";
import { decodePayload } from "@/lib/encoder";
import { generateTechStackMarkdown } from "@/lib/tech-stack-markdown";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params;

  try {
    const { stack, profile } = decodePayload(hash);
    const markdown = generateTechStackMarkdown(stack, profile);

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch {
    return new NextResponse("Invalid share link", { status: 400 });
  }
}
