import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { technologies } from "../src/data/technologies.ts";

const DEVICON_BASE = "https://raw.githubusercontent.com/devicons/devicon/master/icons";
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
  hono: {
    type: "simple-icons",
    slug: "hono",
    fillColor: "#E36002",
  },
  render: {
    type: "simple-icons",
    slug: "render",
    fillColor: "#46E3B7",
  },
  webrtc: {
    type: "simple-icons",
    slug: "webrtc",
    fillColor: "#333333",
  },
  jaeger: {
    type: "simple-icons",
    slug: "jaeger",
    fillColor: "#60D0E4",
  },
  nuxt: {
    type: "inline",
    svg: '<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M281.44 397.667H438.32C443.326 397.667 448.118 395.908 452.453 393.427C456.789 390.946 461.258 387.831 463.76 383.533C466.262 379.236 468.002 374.36 468 369.399C467.998 364.437 466.266 359.563 463.76 355.268L357.76 172.947C355.258 168.65 352.201 165.534 347.867 163.053C343.532 160.573 337.325 158.813 332.32 158.813C327.315 158.813 322.521 160.573 318.187 163.053C313.852 165.534 310.795 168.65 308.293 172.947L281.44 219.587L227.733 129.13C225.229 124.834 222.176 120.307 217.84 117.827C213.504 115.346 208.713 115 203.707 115C198.701 115 193.909 115.346 189.573 117.827C185.238 120.307 180.771 124.834 178.267 129.13L46.8267 355.268C44.3208 359.563 44.0022 364.437 44 369.399C43.9978 374.36 44.3246 379.235 46.8267 383.533C49.3288 387.83 53.7979 390.946 58.1333 393.427C62.4688 395.908 67.2603 397.667 72.2667 397.667H171.2C210.401 397.667 238.934 380.082 258.827 346.787L306.88 263.4L332.32 219.587L410.053 352.44H306.88L281.44 397.667ZM169.787 352.44H100.533L203.707 174.36L256 263.4L221.361 323.784C208.151 345.387 193.089 352.44 169.787 352.44Z" fill="#00DC82"/></svg>',
  },
  deno: {
    type: "inline",
    svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="M1.105 18.02A11.9 11.9 0 0 1 0 12.985q0-.698.078-1.376a12 12 0 0 1 .231-1.34A12 12 0 0 1 4.025 4.02a12 12 0 0 1 5.46-2.771 12 12 0 0 1 3.428-.23c1.452.112 2.825.477 4.077 1.05a12 12 0 0 1 2.78 1.774 12.02 12.02 0 0 1 4.053 7.078A12 12 0 0 1 24 12.985q0 .454-.036.914a12 12 0 0 1-.728 3.305 12 12 0 0 1-2.38 3.875c-1.33 1.357-3.02 1.962-4.43 1.936a4.4 4.4 0 0 1-2.724-1.024c-.99-.853-1.391-1.83-1.53-2.919a5 5 0 0 1 .128-1.518c.105-.38.37-1.116.76-1.437-.455-.197-1.04-.624-1.226-.829-.045-.05-.04-.13 0-.183a.155.155 0 0 1 .177-.053c.392.134.869.267 1.372.35.66.111 1.484.25 2.317.292 2.03.1 4.153-.813 4.812-2.627s.403-3.609-1.96-4.685-3.454-2.356-5.363-3.128c-1.247-.505-2.636-.205-4.06.582-3.838 2.121-7.277 8.822-5.69 15.032a.191.191 0 0 1-.315.19 12 12 0 0 1-1.25-1.634 12 12 0 0 1-.769-1.404M11.57 6.087c.649-.051 1.214.501 1.31 1.236.13.979-.228 1.99-1.41 2.013-1.01.02-1.315-.997-1.248-1.614.066-.616.574-1.575 1.35-1.635"/></svg>',
  },
  go: {
    type: "simple-icons",
    slug: "go",
    fillColor: "#00ADD8",
  },
  kotlin: {
    type: "inline",
    svg: '<svg viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.06217 0.00842285L0 9.53844V18.058L9.04935 8.99311L18.0496 0.00842285H9.06217Z" fill="url(#paint0_linear)"/><path d="M9.04935 8.99243L18.0496 18.0573H0L9.04935 8.99243Z" fill="url(#paint1_linear)"/><path d="M9.06217 0.00842285L0 9.53844V0.00842285H9.06217Z" fill="url(#paint2_linear)"/><defs><linearGradient id="paint0_linear" x1="5.35928" y1="25.0013" x2="22.1554" y2="8.20518" gradientUnits="userSpaceOnUse"><stop offset="0.10753" stop-color="#C757BC"/><stop offset="0.17288" stop-color="#CD5CA9"/><stop offset="0.49191" stop-color="#E8744F"/><stop offset="0.71582" stop-color="#F88316"/><stop offset="0.82323" stop-color="#FF8900"/></linearGradient><linearGradient id="paint1_linear" x1="13.9218" y1="20.341" x2="15.634" y2="13.5526" gradientUnits="userSpaceOnUse"><stop stop-color="#00AFFF"/><stop offset="0.556122" stop-color="#5282FF"/><stop offset="1" stop-color="#945DFF"/></linearGradient><linearGradient id="paint2_linear" x1="6.79089" y1="13.6953" x2="13.2904" y2="8.3753" gradientUnits="userSpaceOnUse"><stop stop-color="#00AFFF"/><stop offset="0.556122" stop-color="#5282FF"/><stop offset="1" stop-color="#945DFF"/></linearGradient></defs></svg>',
  },
  dart: {
    type: "inline",
    svg: '<svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"><path fill="#01579B" d="M51,141l-26-26c-3.08-3.17-5-7.63-5-12c0-2.02,1.14-5.18,2-7l24-50L51,141z"/><path fill="#40C4FF" d="M140,51l-26-26c-2.27-2.28-7-5-11-5c-3.44,0-6.81,0.69-9,2L46,46L140,51z"/><polygon fill="#40C4FF" points="82,172 145,172 145,145 98,130 55,145"/><path fill="#29B6F6" d="M46,127c0,8.02,1.01,9.99,5,14l4,4h90l-44-50L46,46V127z"/><path fill="#01579B" d="M126,46H46l99,99h27V83l-32-32C135.51,46.49,131.51,46,126,46z"/></svg>',
  },
  dotnet: {
    type: "inline",
    svg: '<svg viewBox="0 0 456 456" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="456" height="456" fill="#512BD4"/><path d="M81.2738 291.333C78.0496 291.333 75.309 290.259 73.052 288.11C70.795 285.906 69.6665 283.289 69.6665 280.259C69.6665 277.173 70.795 274.529 73.052 272.325C75.309 270.121 78.0496 269.019 81.2738 269.019C84.5518 269.019 87.3193 270.121 89.5763 272.325C91.887 274.529 93.0424 277.173 93.0424 280.259C93.0424 283.289 91.887 285.906 89.5763 288.11C87.3193 290.259 84.5518 291.333 81.2738 291.333Z" fill="white"/><path d="M210.167 289.515H189.209L133.994 202.406C132.597 200.202 131.441 197.915 130.528 195.546H130.044C130.474 198.081 130.689 203.508 130.689 211.827V289.515H112.149V171H134.477L187.839 256.043C190.096 259.57 191.547 261.994 192.192 263.316H192.514C191.977 260.176 191.708 254.859 191.708 247.365V171H210.167V289.515Z" fill="white"/><path d="M300.449 289.515H235.561V171H297.87V187.695H254.746V221.249H294.485V237.861H254.746V272.903H300.449V289.515Z" fill="white"/><path d="M392.667 187.695H359.457V289.515H340.272V187.695H307.143V171H392.667V187.695Z" fill="white"/></svg>',
  },
  materialui: {
    type: "inline",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 32" fill="none"><path d="M30.343 21.976a1 1 0 00.502-.864l.018-5.787a1 1 0 01.502-.864l3.137-1.802a1 1 0 011.498.867v10.521a1 1 0 01-.502.867l-11.839 6.8a1 1 0 01-.994.001l-9.291-5.314a1 1 0 01-.504-.868v-5.305c0-.006.007-.01.013-.007.005.003.012 0 .012-.007v-.006c0-.004.002-.008.006-.01l7.652-4.396c.007-.004.004-.015-.004-.015a.008.008 0 01-.008-.008l.015-5.201a1 1 0 00-1.5-.87l-5.687 3.277a1 1 0 01-.998 0L6.666 9.7a1 1 0 00-1.499.866v9.4a1 1 0 01-1.496.869l-3.166-1.81a1 1 0 01-.504-.87l.028-16.43A1 1 0 011.527.86l10.845 6.229a1 1 0 00.996 0L24.21.86a1 1 0 011.498.868v16.434a1 1 0 01-.501.867l-5.678 3.27a1 1 0 00.004 1.735l3.132 1.783a1 1 0 00.993-.002l6.685-3.839zM31 7.234a1 1 0 001.514.857l3-1.8A1 1 0 0036 5.434V1.766A1 1 0 0034.486.91l-3 1.8a1 1 0 00-.486.857v3.668z" fill="#007FFF"/></svg>',
  },
  jetbrains: {
    type: "simple-icons",
    slug: "jetbrains",
    fillColor: "#000000",
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

  if (source.type === "inline") {
    return normalizeSvg(source.svg);
  }

  const url = getSourceUrl(source);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${tech.id} from ${url}: ${response.status}`);
  }

  const rawSvg = await response.text();
  return normalizeSvg(rawSvg, source.fillColor);
}

/** Categories whose icons are bundled in the critical (eagerly loaded) chunk. */
const CRITICAL_CATEGORIES = new Set(["language", "frontend"]);

function createCriticalModule(registry) {
  return `export const criticalIconSvgs: Record<string, string> = ${JSON.stringify(registry, null, 2)};\n`;
}

function createDeferredModule(registry) {
  return `export const deferredIconSvgs: Record<string, string> = ${JSON.stringify(registry, null, 2)};\n`;
}

async function main() {
  const critical = {};
  const deferred = {};

  for (const tech of technologies) {
    const svg = await fetchSvg(tech);
    if (CRITICAL_CATEGORIES.has(tech.category)) {
      critical[tech.id] = svg;
    } else {
      deferred[tech.id] = svg;
    }
  }

  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data");

  const criticalFile = path.join(dir, "tech-icons-critical.generated.ts");
  const deferredFile = path.join(dir, "tech-icons-deferred.generated.ts");

  await writeFile(criticalFile, createCriticalModule(critical));
  console.log(`wrote ${criticalFile} (${Object.keys(critical).length} icons)`);

  await writeFile(deferredFile, createDeferredModule(deferred));
  console.log(`wrote ${deferredFile} (${Object.keys(deferred).length} icons)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
