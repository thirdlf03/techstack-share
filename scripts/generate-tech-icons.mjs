import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { technologies } from "../src/data/technologies.ts";

const DEVICON_BASE =
  "https://raw.githubusercontent.com/devicons/devicon/master/icons";
const SIMPLE_ICONS_BASE =
  "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons";

const OVERRIDES = {
  aws: {
    type: "devicon",
    folder: "amazonwebservices",
    fileName: "amazonwebservices-original-wordmark.svg",
  },
  c: {
    type: "devicon",
    folder: "c",
    fileName: "c-original.svg",
  },
  digitalocean: {
    type: "devicon",
    folder: "digitalocean",
    fileName: "digitalocean-original.svg",
  },
  gin: {
    type: "simple-icons",
    slug: "gin",
    fillColor: "#008ECF",
  },
  mysql: {
    type: "devicon",
    folder: "mysql",
    fileName: "mysql-original.svg",
  },
  nestjs: {
    type: "devicon",
    folder: "nestjs",
    fileName: "nestjs-original.svg",
  },
  react: {
    type: "devicon",
    folder: "react",
    fileName: "react-original.svg",
  },
  reactnative: {
    type: "devicon",
    folder: "react",
    fileName: "react-original.svg",
  },
  spring: {
    type: "devicon",
    folder: "spring",
    fileName: "spring-original.svg",
  },
  swiftui: {
    type: "devicon",
    folder: "swift",
    fileName: "swift-original.svg",
  },
  tailwind: {
    type: "devicon",
    folder: "tailwindcss",
    fileName: "tailwindcss-original.svg",
  },
  zig: {
    type: "devicon",
    folder: "zig",
    fileName: "zig-original.svg",
  },
};

function stripDeviconVariant(name) {
  return name.replace(/-(plain|original|line)(-wordmark)?$/, "");
}

function getSourceForTechnology(tech) {
  const override = OVERRIDES[tech.id];
  if (override) return override;

  const fileName = `${tech.deviconClass.replace("devicon-", "")}.svg`;
  return {
    type: "devicon",
    folder: stripDeviconVariant(fileName.replace(/\.svg$/, "")),
    fileName,
  };
}

function getSourceUrl(source) {
  if (source.type === "simple-icons") {
    return `${SIMPLE_ICONS_BASE}/${source.slug}.svg`;
  }

  return `${DEVICON_BASE}/${source.folder}/${source.fileName}`;
}

function normalizeSvg(svg, fillColor) {
  let normalized = svg
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/\s(width|height)="[^"]*"/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  normalized = normalized.replace(
    /<svg\b/,
    `<svg ${
      fillColor ? `fill="${fillColor}" ` : ""
    }preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"`,
  );

  return normalized;
}

async function fetchSvg(tech) {
  const source = getSourceForTechnology(tech);
  const url = getSourceUrl(source);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${tech.id} from ${url}: ${response.status}`);
  }

  const rawSvg = await response.text();
  return normalizeSvg(rawSvg, source.fillColor);
}

function createModule(registry) {
  return `export const technologyIconSvgs = ${JSON.stringify(registry, null, 2)} as const;\n\n` +
    `export type TechnologyIconId = keyof typeof technologyIconSvgs;\n\n` +
    `export function getTechnologyIconSvg(id: string): string | null {\n` +
    `  return technologyIconSvgs[id as TechnologyIconId] ?? null;\n` +
    `}\n`;
}

async function main() {
  const registry = {};

  for (const tech of technologies) {
    registry[tech.id] = await fetchSvg(tech);
  }

  const outputFile = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../src/data/tech-icons.generated.ts",
  );

  await writeFile(outputFile, createModule(registry));
  console.log(`wrote ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
