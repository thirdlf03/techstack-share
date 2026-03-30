import { NextResponse } from "next/server";

const GITHUB_OWNER = "thirdlf03";
const GITHUB_REPO = "techstack-share";

export async function POST(request: Request) {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let body: { techName?: string; docUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { techName, docUrl } = body;
  if (!techName || typeof techName !== "string" || !techName.trim()) {
    return NextResponse.json({ error: "techName is required" }, { status: 400 });
  }

  if (techName.trim().length > 100) {
    return NextResponse.json({ error: "techName is too long" }, { status: 400 });
  }

  const title = `[技術追加リクエスト] ${techName.trim()}`;
  const issueBody = [
    `## 追加リクエスト`,
    ``,
    `**技術名:** ${techName.trim()}`,
    docUrl && typeof docUrl === "string" && docUrl.trim()
      ? `**ドキュメントURL:** ${docUrl.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title,
        body: issueBody,
        labels: ["tech-request"],
      }),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[api/request-tech] GitHub API error:", res.status, errorText);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 502 });
  }

  const issue = await res.json();
  return NextResponse.json({ url: issue.html_url }, { status: 201 });
}
