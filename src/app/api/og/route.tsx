import { ImageResponse } from "next/og";
import { decode } from "@/lib/encoder";
import { getTechById } from "@/data/technologies";

export const runtime = "edge";

const RATING_LABELS: Record<number, string> = {
  5: "Expert",
  4: "Advanced",
  3: "Intermediate",
  2: "Beginner",
  1: "Learning",
};

function getDeviconSvgUrl(deviconClass: string): string {
  const name = deviconClass.replace("devicon-", "");
  const folder = name.replace(/-(plain|original|line)(-wordmark)?$/, "");
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${folder}/${name}.svg`;
}

async function loadGoogleFont(text: string): Promise<ArrayBuffer> {
  const API = `https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(API, {
      headers: {
        // Old Safari UA to get truetype format (Satori doesn't support woff2)
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );
  if (!resource) throw new Error("Failed to load font");
  return await (await fetch(resource[1])).arrayBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return new Response("Missing data parameter", { status: 400 });
  }

  let stack;
  try {
    stack = decode(data);
  } catch {
    return new Response("Invalid data", { status: 400 });
  }

  const groups = [5, 4, 3, 2, 1]
    .map((rating) => ({
      rating,
      label: RATING_LABELS[rating],
      techs: Object.entries(stack)
        .filter(([, r]) => r === rating)
        .map(([id]) => getTechById(id))
        .filter(Boolean),
    }))
    .filter((g) => g.techs.length > 0);

  // フォントサブセット用にOGP内で使う全テキストを収集
  const allText =
    "My TechStack skills " +
    Object.keys(stack).length +
    groups
      .map(
        (g) =>
          RATING_LABELS[g.rating] + g.techs.map((t) => t!.name).join("")
      )
      .join("");

  const fontData = await loadGoogleFont(allText);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#111113",
          color: "#ffffff",
          padding: "40px 48px",
          fontFamily: "Noto Sans",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{ fontSize: "40px", fontWeight: "700", color: "#ffffff" }}
          >
            My TechStack
          </span>
          <span style={{ fontSize: "20px", color: "#71717a" }}>
            {Object.keys(stack).length} skills
          </span>
        </div>

        {/* Groups */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: 1,
          }}
        >
          {groups.map((group) => (
            <div
              key={group.rating}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {/* Rating header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "4px" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "3px",
                        backgroundColor:
                          i < group.rating ? "#fbbf24" : "#3f3f46",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    color: "#a1a1aa",
                    fontSize: "17px",
                    fontWeight: "700",
                  }}
                >
                  {group.label}
                </span>
              </div>

              {/* Tech chips with icons */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {group.techs.map((tech) => (
                  <div
                    key={tech!.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#27272a",
                      border: "1px solid #52525b",
                      borderRadius: "10px",
                      padding: "6px 14px",
                      fontSize: "18px",
                      fontWeight: "400",
                      color: "#f4f4f5",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getDeviconSvgUrl(tech!.deviconClass)}
                      alt=""
                      width={22}
                      height={22}
                    />
                    <span>{tech!.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
          }}
        >
          <span style={{ color: "#52525b", fontSize: "14px" }}>
            techstack-share.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
