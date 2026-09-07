/**
 * Regenerates the two derived desktop wallpapers from the one source photo,
 * `public/win95-clouds-bg.jpg` (1600x1200, 395 KB):
 *
 *   public/win95-clouds-bg.webp  the same picture at 30 KB — 13x smaller,
 *                                measured on the committed pair — offered
 *                                first through image-set() with the JPEG
 *                                declaration behind it as the fallback
 *   public/win95-clouds-16.png   the "Clouds (16 colours)" wallpaper: the same
 *                                picture ordered-dithered down to the sky half
 *                                of the 16 VGA colours a real Windows 95
 *                                install could show, written as an indexed
 *                                (colour type 3) PNG
 *
 * Run by hand, not from `prebuild`: both outputs are committed, the source
 * changes roughly never, and the WebP half needs an encoder that is not a
 * dependency of this repo (see scripts/webp.js). Wiring it into every build
 * would make `npm run build` fail on a machine that has neither encoder, for
 * no gain.
 *
 *   node scripts/build-wallpapers.js
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import path from 'node:path';
import jpeg from 'jpeg-js';
import { downsample } from './dither.js';
import { encodeWebp, readWebpSize } from './webp.js';
import { PALETTE } from '../src/lib/pixelIcons/palette.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SOURCE = path.join(PUBLIC_DIR, 'win95-clouds-bg.jpg');

const WEBP_OUT = path.join(PUBLIC_DIR, 'win95-clouds-bg.webp');
const WEBP_QUALITY = 78;
// The JPEG is 395 KB. Anything above this and the WebP has stopped being an
// optimisation worth a second image-set() source.
const WEBP_MAX_BYTES = 120 * 1024;

const PNG16_OUT = path.join(PUBLIC_DIR, 'win95-clouds-16.png');
// Ordered dither is high-frequency noise, which is exactly what PNG's filters
// cannot predict, so the file grows almost linearly with pixel count. 800x600
// first (a real Win95 desktop resolution); 640x480 (the other one) if the
// bigger grid does not fit the budget.
const PNG16_WIDTHS = [800, 640];
// A wallpaper is not a hero image: it is decoration behind everything else,
// and at eight colours and 4 bits a pixel there is no excuse for it to weigh
// more than an icon sheet. Enforced below, not merely aspired to.
const PNG16_MAX_BYTES = 64 * 1024;

// ── 16-colour wallpaper ─────────────────────────────────────────────────────

function toRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

// The half of the VGA palette a sky and a cloud can be built out of: black,
// gray, silver, white, aqua, teal, blue, navy. The reds, yellows, greens and
// magentas are left out on purpose, and that omission is what makes the
// wallpaper blue.
//
// A greedy mean-matching plan (see mixingPlan) will happily cancel fuchsia
// against aqua to land on a pale blue: the arithmetic is right, and the sky
// comes out under a layer of magenta confetti. The previous pass fought that
// by letting a pixel mix from only the 3 nearest entries of the full palette,
// which suppressed the speckle by also suppressing the hue -- the sky read
// gray. Taking the eight colours the picture is actually made of out of the
// palette instead lets every one of them take part, so the plan can reach the
// real hue and has nothing fuchsia to reach it with.
const SKY_KEYS = ['k', 'd', 'g', 'w', 'c', 'C', 'b', 'B'];
const SKY_PALETTE = SKY_KEYS.map((key) => toRgb(PALETTE[key]));

// Bayer 4x4: the classic ordered-dither threshold matrix. Reading a pixel's
// position in this grid instead of diffusing error into its neighbours is what
// gives the flat, regular crosshatch a 1995 display driver produced — Atkinson
// diffusion (scripts/dither.js, used for the Nokia thumbnails) would look
// smoother and wronger here.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// A 4x4 matrix has 16 levels, so each pixel gets a 16-entry mixing plan and
// the matrix indexes straight into it with no rescaling.
const PLAN_SIZE = 16;

// How many palette entries a single pixel may be mixed from: all of them,
// now that "all of them" is the sky subset above and not the whole VGA 16.
const PLAN_CANDIDATES = SKY_PALETTE.length;

// Weighted RGB distance. Plain sum-of-squares treats a 60-point error in blue
// as it treats one in green, which is why an unweighted nearest-colour lookup
// sends this photo's entire pale-blue sky to silver.
function colourDistance(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

function luma({ r, g, b }) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

const planCache = new Map();

/**
 * Builds the list of 16 palette entries whose *average* is closest to
 * `target`, greedily: each round adds whichever colour pulls the running mean
 * nearest, then the finished list is sorted by brightness so the Bayer matrix
 * walks it dark-to-light. This is Yliluoma's ordered-dithering plan.
 *
 * Returns indices into SKY_PALETTE rather than colours, because the PNG this
 * feeds is indexed and never needs the RGB again.
 *
 * The obvious alternative — add the Bayer value to each channel and take the
 * nearest colour — cannot work against this palette. A single threshold moves
 * a pixel along the gray diagonal, and VGA-16 has no light blue for it to land
 * on, so a sky of rgb(125,181,218) quantises to silver at every threshold and
 * the wallpaper comes out grayscale. Mixing plans let the same sky be built
 * out of silver, white and aqua, which is what a 1995 driver actually did.
 */
function mixingPlan(target) {
  const key = (target.r << 16) | (target.g << 8) | target.b;
  const cached = planCache.get(key);
  if (cached) return cached;

  const candidates = SKY_PALETTE.map((colour, index) => ({ colour, index }))
    .sort((a, b) => colourDistance(a.colour, target) - colourDistance(b.colour, target))
    .slice(0, PLAN_CANDIDATES);

  const plan = [];
  const sum = { r: 0, g: 0, b: 0 };
  for (let n = 0; n < PLAN_SIZE; n += 1) {
    let best = candidates[0];
    let bestDistance = Infinity;
    for (const candidate of candidates) {
      const mean = {
        r: (sum.r + candidate.colour.r) / (n + 1),
        g: (sum.g + candidate.colour.g) / (n + 1),
        b: (sum.b + candidate.colour.b) / (n + 1),
      };
      const distance = colourDistance(mean, target);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
    plan.push(best);
    sum.r += best.colour.r;
    sum.g += best.colour.g;
    sum.b += best.colour.b;
  }

  const indices = plan
    .sort((a, b) => luma(a.colour) - luma(b.colour))
    .map((entry) => entry.index);
  planCache.set(key, indices);
  return indices;
}

/** Dither to SKY_PALETTE indices, one byte per pixel. */
function orderedDither({ width, height, data }) {
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const plan = mixingPlan({ r: data[i], g: data[i + 1], b: data[i + 2] });
      out[y * width + x] = plan[BAYER_4X4[y % 4][x % 4]];
    }
  }
  return out;
}

// ── indexed PNG encoder ─────────────────────────────────────────────────────
//
// Written out by hand rather than with pngjs, which only emits 8-bit RGBA. A
// truecolor PNG of eight colours spends 32 bits a pixel saying one of eight
// things, and deflate cannot claw all of that back: the same image was 401 KB
// that way and is a fraction of it as colour type 3 at 4 bits a pixel.
//
// Every row is written with filter type 0 (None). The usual reason to filter
// is a smooth gradient, where each pixel nearly equals its neighbour; this
// image is ordered-dither noise with a 4-pixel period, where a filter turns a
// short repeating pattern deflate would otherwise match into differences that
// no longer repeat.

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_BIT_DEPTH = 4;
const PNG_COLOUR_TYPE_INDEXED = 3;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** length · type · data · CRC of (type + data), which is what PNG checks. */
function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/**
 * Pack palette indices into an indexed PNG.
 *
 * Only the entries the image actually uses reach PLTE, and they are renumbered
 * to match, so an unused palette colour costs neither three bytes nor a wider
 * bit depth.
 */
function encodeIndexedPng(indices, width, height, palette) {
  const used = [...new Set(indices)].sort((a, b) => a - b);
  const maxEntries = 2 ** PNG_BIT_DEPTH;
  if (used.length > maxEntries) {
    throw new Error(
      `${used.length} colours will not fit ${PNG_BIT_DEPTH}-bit indices (max ${maxEntries})`,
    );
  }
  const slotOf = new Map(used.map((entry, slot) => [entry, slot]));

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = PNG_BIT_DEPTH;
  ihdr[9] = PNG_COLOUR_TYPE_INDEXED;
  ihdr[10] = 0; // compression: deflate, the only value PNG defines
  ihdr[11] = 0; // filter method: adaptive, the only value PNG defines
  ihdr[12] = 0; // not interlaced

  const plte = Buffer.alloc(used.length * 3);
  used.forEach((entry, slot) => {
    plte[slot * 3] = palette[entry].r;
    plte[slot * 3 + 1] = palette[entry].g;
    plte[slot * 3 + 2] = palette[entry].b;
  });

  // Two pixels a byte, high nibble first, and every row starts on a byte
  // boundary — an odd width leaves the last low nibble as padding.
  const stride = Math.ceil((width * PNG_BIT_DEPTH) / 8);
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter type: None
    for (let x = 0; x < width; x += 1) {
      const slot = slotOf.get(indices[y * width + x]);
      const at = rowStart + 1 + (x >> 1);
      if ((x & 1) === 0) raw[at] |= slot << 4;
      else raw[at] |= slot;
    }
  }

  return {
    buffer: Buffer.concat([
      PNG_SIGNATURE,
      pngChunk('IHDR', ihdr),
      pngChunk('PLTE', plte),
      pngChunk('IDAT', deflateSync(raw, { level: 9 })),
      pngChunk('IEND', Buffer.alloc(0)),
    ]),
    colours: used.length,
  };
}

function build16Colour(decoded) {
  let chosen = null;
  for (const width of PNG16_WIDTHS) {
    const small = downsample(decoded, width);
    const { buffer, colours } = encodeIndexedPng(
      orderedDither(small),
      small.width,
      small.height,
      SKY_PALETTE,
    );
    chosen = { buffer, colours, width: small.width, height: small.height };
    if (buffer.length <= PNG16_MAX_BYTES) break;
  }
  writeFileSync(PNG16_OUT, chosen.buffer);
  return chosen;
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(SOURCE)) {
    throw new Error(`source wallpaper missing: ${path.relative(ROOT, SOURCE)}`);
  }
  const sourceBytes = readFileSync(SOURCE);
  const decoded = jpeg.decode(sourceBytes, { useTArray: true });

  // The 16-colour pass runs first because it needs nothing but this repo's own
  // devDependencies. A machine with no WebP encoder still regenerates half the
  // work and gets told exactly what is missing, instead of failing before it
  // has written anything.
  const png16 = build16Colour(decoded);
  console.log(
    `[wallpapers] win95-clouds-16.png   ${png16.width}x${png16.height} indexed, ` +
      `${png16.colours} colours  ${(png16.buffer.length / 1024).toFixed(1)} KB`,
  );
  if (png16.buffer.length > PNG16_MAX_BYTES) {
    console.warn(
      `[wallpapers] the 16-colour PNG is ${(png16.buffer.length / 1024).toFixed(1)} KB, ` +
        `over the ${PNG16_MAX_BYTES / 1024} KB budget, and ${PNG16_WIDTHS.at(-1)}px wide ` +
        'is already the smallest rung of the ladder. Add a narrower one or ' +
        'take a colour out rather than shipping it.',
    );
  }

  const encoder = await encodeWebp({
    source: SOURCE,
    out: WEBP_OUT,
    quality: WEBP_QUALITY,
    resize: [1600, 1200],
    playwright: process.env.WALLPAPER_PLAYWRIGHT,
  });
  const webpBytes = readFileSync(WEBP_OUT);
  const size = readWebpSize(webpBytes);
  const ratio = (sourceBytes.length / webpBytes.length).toFixed(1);
  console.log(
    `[wallpapers] win95-clouds-bg.webp  ${size ? `${size.width}x${size.height}` : 'size unreadable'} ` +
      `q${WEBP_QUALITY} via ${encoder}  ${(webpBytes.length / 1024).toFixed(1)} KB ` +
      `(${ratio}x smaller than the JPEG)`,
  );
  if (webpBytes.length > WEBP_MAX_BYTES) {
    console.warn(
      `[wallpapers] WebP is over the ${WEBP_MAX_BYTES / 1024} KB budget — ` +
        'drop the quality rather than shipping it.',
    );
  }
}

main().catch((error) => {
  // The whole error, not error.message: half of what can go wrong here is a
  // decoder throwing from three frames down, and the stack is the only part
  // of that which says where.
  console.error('[wallpapers] failed:', error);
  process.exitCode = 1;
});
