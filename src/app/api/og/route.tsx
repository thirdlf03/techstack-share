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

  // ★の数でグループ化（5→1の降順）
  const groups = [5, 4, 3, 2, 1]
    .map((rating) => ({
      rating,
      label: RATING_LABELS[rating],
      techs: Object.entries(stack)
        .filter(([, r]) => r === rating)
        .map(([id]) => getTechById(id))
        .filter(Boolean)
        .map((t) => t!.name),
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
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          padding: "48px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: "32px",
          }}
        >
          My TechStack
        </div>
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
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                <span style={{ color: "#facc15" }}>
                  {"★".repeat(group.rating)}
                </span>
                <span style={{ color: "#a1a1aa" }}>{group.label}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {group.techs.map((name) => (
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#1a1a2e",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "16px",
                    }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
