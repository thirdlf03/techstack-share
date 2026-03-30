import type { TechStack } from "@/lib/encoder";
import { loadTechnologyIconImage } from "@/lib/technology-icons";
import { groupTechStack } from "@/lib/share-card";

type ExportImageOptions = {
  pixelRatio?: number;
  width?: number;
};

const COLORS = {
  accent: "#2563EB",
  accentSoft: "#DBEAFE",
  background: "#F8FAFC",
  border: "#BFDBFE",
  cardBorder: "#C7D2FE",
  cardFill: "#EEF2FF",
  muted: "#64748B",
  star: "#F59E0B",
  text: "#0F172A",
};

const LAYOUT = {
  cardGap: 16,
  cardHeight: 112,
  columns: 6,
  groupGap: 24,
  headerHeight: 72,
  iconSize: 36,
  outerPadding: 48,
  panelPadding: 36,
  sectionHeaderHeight: 34,
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  const pushWord = (nextWord: string) => {
    const candidate = current ? `${current} ${nextWord}` : nextWord;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      return;
    }

    if (current) {
      lines.push(current);
      current = "";
    }

    if (ctx.measureText(nextWord).width <= maxWidth) {
      current = nextWord;
      return;
    }

    let segment = "";
    for (const char of nextWord) {
      const candidateSegment = `${segment}${char}`;
      if (ctx.measureText(candidateSegment).width > maxWidth && segment) {
        lines.push(segment);
        segment = char;
        if (lines.length === maxLines) {
          return;
        }
      } else {
        segment = candidateSegment;
      }
    }
    current = segment;
  };

  for (const word of words) {
    if (lines.length === maxLines) {
      break;
    }
    pushWord(word);
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  if (lines.length === maxLines) {
    const lastLine = lines[maxLines - 1] ?? "";
    if (ctx.measureText(lastLine).width > maxWidth) {
      let truncated = lastLine;
      while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
        truncated = truncated.slice(0, -1);
      }
      lines[maxLines - 1] = `${truncated}…`;
    }
  }

  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function createCanvas(width: number, height: number, pixelRatio: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * pixelRatio);
  canvas.height = Math.ceil(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  ctx.scale(pixelRatio, pixelRatio);
  return { canvas, ctx };
}

function measureHeight(stack: TechStack, width: number) {
  const groups = groupTechStack(stack);
  const innerWidth = width - LAYOUT.outerPadding * 2 - LAYOUT.panelPadding * 2;
  const cardWidth =
    (innerWidth - LAYOUT.cardGap * (LAYOUT.columns - 1)) / LAYOUT.columns;

  let height = LAYOUT.outerPadding * 2 + LAYOUT.panelPadding * 2 + LAYOUT.headerHeight;

  for (const group of groups) {
    const rowCount = Math.max(1, Math.ceil(group.techs.length / LAYOUT.columns));
    height +=
      LAYOUT.sectionHeaderHeight +
      rowCount * LAYOUT.cardHeight +
      Math.max(0, rowCount - 1) * LAYOUT.cardGap +
      LAYOUT.groupGap;
  }

  return {
    cardWidth,
    groups,
    height: Math.ceil(height),
    innerWidth,
  };
}

export async function renderShareCardImage(
  stack: TechStack,
  options: ExportImageOptions = {},
): Promise<Blob> {
  const width = options.width ?? 1200;
  const pixelRatio = options.pixelRatio ?? 2;
  const { groups, height, cardWidth } = measureHeight(stack, width);

  const { canvas, ctx } = createCanvas(width, height, pixelRatio);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  const panelX = LAYOUT.outerPadding;
  const panelY = LAYOUT.outerPadding;
  const panelWidth = width - LAYOUT.outerPadding * 2;
  const panelHeight = height - LAYOUT.outerPadding * 2;

  roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 28);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  let cursorY = panelY + LAYOUT.panelPadding;

  ctx.fillStyle = COLORS.text;
  ctx.font = '700 34px "Geist", "Noto Sans JP", sans-serif';
  ctx.fillText("My TechStack", panelX + LAYOUT.panelPadding, cursorY + 28);

  ctx.fillStyle = COLORS.muted;
  ctx.font = '500 17px "Geist", "Noto Sans JP", sans-serif';
  ctx.fillText(
    `${Object.keys(stack).length} skills`,
    panelX + LAYOUT.panelPadding,
    cursorY + 56,
  );

  cursorY += LAYOUT.headerHeight;

  const iconIds = groups.flatMap((group) => group.techs.map((tech) => tech.id));
  const uniqueIconIds = [...new Set(iconIds)];
  const iconMap = new Map(
    await Promise.all(
      uniqueIconIds.map(async (id) => [id, await loadTechnologyIconImage(id)] as const),
    ),
  );

  for (const group of groups) {
    const groupX = panelX + LAYOUT.panelPadding;

    ctx.fillStyle = COLORS.star;
    ctx.font = '700 20px "Geist", "Noto Sans JP", sans-serif';
    ctx.fillText("★".repeat(group.rating), groupX, cursorY + 18);

    ctx.fillStyle = COLORS.muted;
    ctx.font = '600 16px "Geist", "Noto Sans JP", sans-serif';
    ctx.fillText(group.label, groupX + 118, cursorY + 18);

    cursorY += LAYOUT.sectionHeaderHeight;

    ctx.font = '600 16px "Geist", "Noto Sans JP", sans-serif';

    for (const [index, tech] of group.techs.entries()) {
      const column = index % LAYOUT.columns;
      const row = Math.floor(index / LAYOUT.columns);
      const x = groupX + column * (cardWidth + LAYOUT.cardGap);
      const y = cursorY + row * (LAYOUT.cardHeight + LAYOUT.cardGap);

      roundRect(ctx, x, y, cardWidth, LAYOUT.cardHeight, 18);
      ctx.fillStyle = COLORS.cardFill;
      ctx.fill();
      ctx.strokeStyle = COLORS.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const icon = iconMap.get(tech.id);
      if (icon) {
        const iconX = x + cardWidth / 2 - LAYOUT.iconSize / 2;
        ctx.drawImage(icon, iconX, y + 18, LAYOUT.iconSize, LAYOUT.iconSize);
      }

      const textY = y + 72;
      const lines = wrapText(ctx, tech.name, cardWidth - 20, 2);
      ctx.fillStyle = COLORS.text;
      for (const [lineIndex, line] of lines.entries()) {
        const metrics = ctx.measureText(line);
        ctx.fillText(line, x + (cardWidth - metrics.width) / 2, textY + lineIndex * 18);
      }
    }

    cursorY +=
      Math.ceil(group.techs.length / LAYOUT.columns) * LAYOUT.cardHeight +
      Math.max(0, Math.ceil(group.techs.length / LAYOUT.columns) - 1) * LAYOUT.cardGap +
      LAYOUT.groupGap;
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) {
        reject(new Error("Failed to generate PNG blob"));
        return;
      }
      resolve(value);
    }, "image/png");
  });

  return blob;
}
