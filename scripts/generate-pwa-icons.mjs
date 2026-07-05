import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Jimp } from "jimp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const colors = {
  background: 0x4338caff,
  card: 0xffffffff,
  accent: 0x4338caff,
  line: 0x94a3b8ff,
  lineLight: 0xcbd5e1ff,
  circle: 0x4338ca33,
  circleInner: 0x4338ca59,
};

function drawIcon(size, maskable = false) {
  const image = new Jimp({ width: size, height: size, color: colors.background });
  const padding = maskable ? Math.round(size * 0.1) : Math.round(size * 0.08);
  const cardX = padding;
  const cardY = Math.round(size * 0.28);
  const cardW = size - padding * 2;
  const cardH = Math.round(size * 0.39);

  image.scan(cardX, cardY, cardW, cardH, function (x, y, idx) {
    this.bitmap.data[idx] = 255;
    this.bitmap.data[idx + 1] = 255;
    this.bitmap.data[idx + 2] = 255;
    this.bitmap.data[idx + 3] = 245;
  });

  const barHeight = Math.max(2, Math.round(size * 0.028));
  const barGap = Math.max(3, Math.round(size * 0.018));
  const left = cardX + Math.round(size * 0.07);
  const top = cardY + Math.round(size * 0.08);

  image.scan(left, top, Math.round(size * 0.25), barHeight, function (x, y, idx) {
    this.bitmap.data[idx] = 67;
    this.bitmap.data[idx + 1] = 56;
    this.bitmap.data[idx + 2] = 202;
    this.bitmap.data[idx + 3] = 255;
  });

  const lines = [
    { y: top + barHeight + barGap, w: Math.round(size * 0.42), color: colors.line },
    {
      y: top + barHeight + barGap * 2 + barHeight,
      w: Math.round(size * 0.34),
      color: colors.lineLight,
    },
    {
      y: top + barHeight + barGap * 3 + barHeight * 2,
      w: Math.round(size * 0.28),
      color: colors.lineLight,
    },
  ];

  for (const line of lines) {
    image.scan(left, line.y, line.w, barHeight, function (x, y, idx) {
      const color = line.color;
      this.bitmap.data[idx] = (color >> 24) & 255;
      this.bitmap.data[idx + 1] = (color >> 16) & 255;
      this.bitmap.data[idx + 2] = (color >> 8) & 255;
      this.bitmap.data[idx + 3] = color & 255;
    });
  }

  const circleX = cardX + cardW - Math.round(size * 0.16);
  const circleY = cardY + Math.round(cardH * 0.55);
  const outerR = Math.round(size * 0.08);
  const innerR = Math.round(size * 0.045);

  image.scan(0, 0, size, size, function (x, y, idx) {
    const dx = x - circleX;
    const dy = y - circleY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= outerR) {
      this.bitmap.data[idx] = 67;
      this.bitmap.data[idx + 1] = 56;
      this.bitmap.data[idx + 2] = 202;
      this.bitmap.data[idx + 3] = 46;
    }

    if (dist <= innerR) {
      this.bitmap.data[idx] = 67;
      this.bitmap.data[idx + 1] = 56;
      this.bitmap.data[idx + 2] = 202;
      this.bitmap.data[idx + 3] = 89;
    }
  });

  return image;
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  for (const size of sizes) {
    const image = drawIcon(size);
    await image.write(path.join(iconsDir, `icon-${size}x${size}.png`));
  }

  const maskable = drawIcon(512, true);
  await maskable.write(path.join(iconsDir, "icon-maskable-512x512.png"));

  const apple = drawIcon(180);
  await apple.write(path.join(iconsDir, "apple-touch-icon.png"));

  console.log("PWA icons generated in public/icons/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
