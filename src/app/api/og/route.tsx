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
          backgroundColor: "#09090b",
          color: "#fafafa",
          padding: "40px 48px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <span style={{ fontSize: "32px", fontWeight: "bold" }}>
            My TechStack
          </span>
        </div>

        {/* Groups */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
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
                  gap: "8px",
                  borderBottom: "1px solid #27272a",
                  paddingBottom: "6px",
                }}
              >
                <span style={{ color: "#facc15", fontSize: "18px" }}>
                  {"★".repeat(group.rating)}
                  {"☆".repeat(5 - group.rating)}
                </span>
                <span
                  style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 600 }}
                >
                  {group.label}
                </span>
              </div>

              {/* Tech cards */}
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
                      gap: "6px",
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "10px",
                      padding: "6px 14px",
                      fontSize: "15px",
                    }}
                  >
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
          <span style={{ color: "#52525b", fontSize: "13px" }}>
            techstack-share
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
