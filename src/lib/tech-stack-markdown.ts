import type { TechStack, Profile } from "@/lib/encoder";
import { groupTechStack } from "@/lib/share-card";

export function generateTechStackMarkdown(stack: TechStack, profile?: Profile): string {
  const lines: string[] = [];

  const title = profile?.name ? `${profile.name}'s TechStack` : "TechStack";
  lines.push(`# ${title}`);
  lines.push("");
  lines.push("> Tech stack profile shared via TechStack Share.");
  lines.push("> Technologies are grouped by proficiency level (5=Expert, 4=Advanced, 3=Intermediate, 2=Beginner, 1=Learning).");
  lines.push("");

  if (profile?.githubId) {
    lines.push(`GitHub: [@${profile.githubId}](https://github.com/${profile.githubId})`);
    lines.push("");
  }

  const grouped = groupTechStack(stack);
  for (const group of grouped) {
    const stars = "⭐".repeat(group.rating);
    lines.push(`## ${stars} ${group.label}`);
    lines.push("");
    for (const tech of group.techs) {
      lines.push(`- ${tech.name}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
