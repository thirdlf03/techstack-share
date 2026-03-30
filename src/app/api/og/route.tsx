import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { decodePayload } from "@/lib/encoder";
import { deferredIconSvgs } from "@/data/tech-icons-deferred.generated";
import { getTechnologyIconDataUrl, registerDeferredIcons } from "@/lib/technology-icons";
import { groupTechStack } from "@/lib/share-card";

/* eslint-disable react-hooks/purity */

export const runtime = "nodejs";

registerDeferredIcons(deferredIconSvgs);

const fontDataPromise = readFile(
  path.join(process.cwd(), "src/app/api/og/assets/Geist-Regular.ttf"),
);

export async function GET(request: Request) {
  const requestStartedAt = Date.now();
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return new Response("Missing data parameter", { status: 400 });
  }

  let stack, profile;
  const decodeStartedAt = Date.now();
  try {
    const payload = decodePayload(data);
    stack = payload.stack;
    profile = payload.profile;
  } catch {
    return new Response("Invalid data", { status: 400 });
  }
  const decodeDuration = Date.now() - decodeStartedAt;

  const groupingStartedAt = Date.now();
  const allGroups = groupTechStack(stack);

  // --- Fit groups into the fixed 630px OG image ---
  // Available height budget for tech content area:
  //   630 (total) - 80 (outer padding) - 72 (inner padding)
  //   - 80 (header) - 32 (footer+margin) = ~366px
  const BUDGET = 366;
  const GROUP_HEADER = 42; // stars + label + gap
  const ROW_HEIGHT = 48; // card height
  const ROW_GAP = 12;
  const GROUP_GAP = 20;
  const CARDS_PER_ROW = 5;

  function groupHeight(techCount: number): number {
    const rows = Math.ceil(techCount / CARDS_PER_ROW);
    return GROUP_HEADER + rows * ROW_HEIGHT + (rows - 1) * ROW_GAP;
  }

  let usedHeight = 0;
  let totalShown = 0;
  const groups: typeof allGroups = [];

  for (const group of allGroups) {
    const gapBefore = groups.length > 0 ? GROUP_GAP : 0;
    const fullH = gapBefore + groupHeight(group.techs.length);

    if (usedHeight + fullH <= BUDGET) {
      // Entire group fits
      groups.push(group);
      usedHeight += fullH;
      totalShown += group.techs.length;
      continue;
    }

    // Try fitting a partial group (at least 1 row)
    const headerCost = gapBefore + GROUP_HEADER + ROW_HEIGHT;
    if (usedHeight + headerCost <= BUDGET) {
      const remaining = BUDGET - usedHeight - gapBefore - GROUP_HEADER;
      const maxRows = Math.max(1, Math.floor((remaining + ROW_GAP) / (ROW_HEIGHT + ROW_GAP)));
      const maxTechs = maxRows * CARDS_PER_ROW;
      const sliced = group.techs.slice(0, maxTechs);
      groups.push({ ...group, techs: sliced });
      totalShown += sliced.length;
    }
    break; // No more space
  }

  const totalCount = Object.keys(stack).length;
  const hiddenCount = totalCount - totalShown;
  const groupingDuration = Date.now() - groupingStartedAt;

  const fontStartedAt = Date.now();
  const fontData = await fontDataPromise;
  const fontDuration = Date.now() - fontStartedAt;

  const response = new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(248,250,252,1) 60%, rgba(224,231,255,1) 100%)",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        height: "100%",
        padding: "40px 48px",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #bfdbfe",
          borderRadius: "28px",
          boxShadow: "0 24px 60px rgba(37, 99, 235, 0.08)",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          padding: "36px",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {profile?.githubId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://avatars.githubusercontent.com/${profile.githubId}?size=80`}
              alt=""
              width={52}
              height={52}
              style={{ borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "34px", fontWeight: 700 }}>
              {profile?.name || "My TechStack"}
            </span>
            <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
              {profile?.githubId && (
                <div style={{ alignItems: "center", display: "flex", gap: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748b">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span style={{ color: "#64748b", fontSize: "17px", fontWeight: 500 }}>
                    {profile.githubId}
                  </span>
                </div>
              )}
              <span style={{ color: "#64748b", fontSize: "17px", fontWeight: 500 }}>
                {Object.keys(stack).length} skills
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {groups.map((group) => (
            <div
              key={group.rating}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", gap: "4px" }}>
                  {Array.from({ length: group.rating }, (_, i) => (
                    <svg key={i} width="18" height="18" viewBox="0 0 24 24">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"
                        fill="#f59e0b"
                      />
                    </svg>
                  ))}
                </div>
                <span style={{ color: "#64748b", fontSize: "16px", fontWeight: 600 }}>
                  {group.label}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {group.techs.map((tech) => (
                  <div
                    key={tech.id}
                    style={{
                      alignItems: "center",
                      backgroundColor: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      borderRadius: "16px",
                      display: "flex",
                      gap: "10px",
                      minWidth: "166px",
                      padding: "12px 14px",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getTechnologyIconDataUrl(tech.id)}
                      alt=""
                      width={24}
                      height={24}
                      style={{
                        flexShrink: 0,
                        objectFit: "contain",
                      }}
                    />
                    <span
                      style={{
                        color: "#0f172a",
                        fontSize: "15px",
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            alignItems: "center",
            color: "#94a3b8",
            display: "flex",
            fontSize: "14px",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: "12px",
          }}
        >
          <span>{hiddenCount > 0 ? `+${hiddenCount} more skills` : ""}</span>
          <span>techstack-share.vercel.app</span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          data: fontData,
          name: "Geist",
          style: "normal",
          weight: 400,
        },
        {
          data: fontData,
          name: "Geist",
          style: "normal",
          weight: 700,
        },
      ],
    },
  );

  const totalDuration = Date.now() - requestStartedAt;
  response.headers.set(
    "Server-Timing",
    [
      `decode;dur=${decodeDuration}`,
      `group;dur=${groupingDuration}`,
      `font;dur=${fontDuration}`,
      `total;dur=${totalDuration}`,
    ].join(", "),
  );

  console.info(
    "[perf][api/og]",
    JSON.stringify({
      decodeDuration,
      fontDuration,
      groups: groups.length,
      selectedCount: Object.keys(stack).length,
      totalDuration,
    }),
  );

  return response;
}
