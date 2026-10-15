import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Minimal PNG encoder (RGBA) for solid brand icons */
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function png(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a = 255] = paint(x, y, size);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function mark(x, y, size) {
  const bg = [244, 244, 242];
  const ink = [22, 22, 22];
  const pad = size * 0.18;
  const left = pad;
  const right = size - pad;
  const top = pad;
  const bottom = size - pad;
  const stroke = size * 0.11;
  const cx = size / 2;

  // cream background
  let color = bg;

  // rounded-ish tile shadow of "M"
  const inX = x >= left && x <= right;
  const inY = y >= top && y <= bottom;
  if (inX && inY) {
    const nx = (x - left) / (right - left);
    const ny = (y - top) / (bottom - top);
    const leftBar = nx < stroke / (right - left);
    const rightBar = nx > 1 - stroke / (right - left);
    const peak =
      Math.abs(nx - 0.5) < 0.22 &&
      ny > 0.18 &&
      ny < 0.55 &&
      Math.abs(ny - (0.55 - Math.abs(nx - 0.5) * 1.4)) < 0.12;
    const vLeft = Math.abs(nx - 0.28) < 0.08 && ny > 0.2 && ny < 0.85;
    const vRight = Math.abs(nx - 0.72) < 0.08 && ny > 0.2 && ny < 0.85;
    if (leftBar || rightBar || peak || vLeft || vRight) color = ink;
  }

  // outer ring
  const dx = x - cx;
  const dy = y - cx;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r > size * 0.46 && r < size * 0.5) color = ink;

  return color;
}

const outDir = join(process.cwd(), "public", "icons");
mkdirSync(outDir, { recursive: true });
for (const size of [192, 512]) {
  const buf = png(size, (x, y, s) => mark(x, y, s));
  writeFileSync(join(outDir, `icon-${size}.png`), buf);
  console.log(`wrote icon-${size}.png`);
}
