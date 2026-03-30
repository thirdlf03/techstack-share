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
  const groups = groupTechStack(stack);
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
            <span style={{ color: "#64748b", fontSize: "17px", fontWeight: 500 }}>
              {Object.keys(stack).length} skills
            </span>
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
            color: "#94a3b8",
            display: "flex",
            fontSize: "14px",
            justifyContent: "flex-end",
            marginTop: "18px",
          }}
        >
          techstack-share.vercel.app
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
