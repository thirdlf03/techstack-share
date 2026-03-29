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
          padding: "48px 56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          <span style={{ fontSize: "42px", fontWeight: "800", color: "#ffffff" }}>
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
            gap: "24px",
            flex: 1,
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
              {/* Rating header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ color: "#fbbf24", fontSize: "24px", letterSpacing: "2px" }}>
                  {"★".repeat(group.rating)}
                  <span style={{ color: "#3f3f46" }}>
                    {"★".repeat(5 - group.rating)}
                  </span>
                </span>
                <span
                  style={{ color: "#a1a1aa", fontSize: "18px", fontWeight: "600" }}
                >
                  {group.label}
                </span>
              </div>

              {/* Tech chips */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {group.techs.map((tech) => (
                  <div
                    key={tech!.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#27272a",
                      border: "1px solid #52525b",
                      borderRadius: "12px",
                      padding: "8px 18px",
                      fontSize: "20px",
                      fontWeight: "500",
                      color: "#f4f4f5",
                    }}
                  >
                    {tech!.name}
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
            marginTop: "16px",
          }}
        >
          <span style={{ color: "#52525b", fontSize: "16px" }}>
            techstack-share.vercel.app
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
