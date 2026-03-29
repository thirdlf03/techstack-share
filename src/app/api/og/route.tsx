import { ImageResponse } from "next/og";
import { decode } from "@/lib/encoder";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getTechsByCategory,
} from "@/data/technologies";

export const runtime = "edge";

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

  const selectedIds = Object.keys(stack);

  const groups = CATEGORIES.map((cat) => ({
    label: CATEGORY_LABELS[cat],
    techs: getTechsByCategory(cat)
      .filter((t) => selectedIds.includes(t.id))
      .map((t) => ({ name: t.name, rating: stack[t.id] })),
  })).filter((g) => g.techs.length > 0);

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
          TechStack Share
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
              key={group.label}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  color: "#a1a1aa",
                  fontWeight: "600",
                }}
              >
                {group.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {group.techs.map((tech) => (
                  <div
                    key={tech.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#1a1a2e",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "16px",
                    }}
                  >
                    <span>{tech.name}</span>
                    <span style={{ color: "#facc15" }}>
                      {"★".repeat(tech.rating)}
                    </span>
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
