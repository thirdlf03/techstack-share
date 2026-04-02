import { NextResponse } from "next/server";

const LLMS_TXT = `# TechStack Share

> A web app for creating, sharing, and visualizing your technology stack profile.

Users select technologies they use, rate their proficiency (1-5), and generate a shareable link.

## URL Structure

- \`/\` — Main page: create and edit your tech stack
- \`/share/{hash}\` — View a shared tech stack profile (HTML)
- \`/share/{hash}.md\` — View a shared tech stack profile (Markdown, machine-readable)
- \`/api/og?data={hash}\` — OGP image (1200x630 PNG)

## Proficiency Levels

- 5: Expert
- 4: Advanced
- 3: Intermediate
- 2: Beginner
- 1: Learning

## Markdown Access

Append \`.md\` to any share URL to get a plain-text Markdown representation of the tech stack. This is useful for LLMs, AI agents, and automation tools.

Example: \`/share/abc123.md\`
`;

export function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
