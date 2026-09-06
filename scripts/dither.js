/**
 * The shared half of the Nokia thumbnail pipeline: which captures exist, and
 * the downsample / grayscale / Atkinson-dither steps dither-screenshots.js
 * runs them through. Also read by build-screenshots.js, which encodes the same
 * captures as WebP for the desktop explorer.
 *
 * The dithered PNGs under public/nokia/ are committed, and deliberately not
 * pinned to a hash: a re-run on a different pngjs or jpeg-js can shift bytes
 * without changing the picture, and a byte-identity guard would fail a
 * legitimate regeneration rather than catch anything. Eyeball
 * `git diff --stat` after a run instead — a real change to a capture moves one
 * file by kilobytes, a decoder difference moves several by a handful of bytes.
 */

const INK = { r: 0x2c, g: 0x2a, b: 0x10 };
const THRESHOLD = 128;

// Where the captures live, relative to the repo root. Not `public/`: they are
// sources, and putting them there shipped a 131 KB JPEG of a picture the site
// only ever shows as a 20 KB WebP (build-screenshots.js) and a 240px 1-bit
// thumbnail (dither-screenshots.js).
export const SOURCE_DIR = 'assets/screenshots';

// Source screenshot -> Nokia project id. Only projects with a real captured
// screenshot get a dithered image; the rest keep the hatch-pattern
// placeholder in WorkDetail.jsx — no fabricated images. Exported (not just
// used by dither-screenshots.js) so tests can assert this list stays in
// sync with the `screenshot` fields in src/data/projects.js.
export const SOURCES = [
  { id: 'medt', file: 'medt-screenshot.jpeg' },
  { id: 'rust-scraper', file: 'rust-scraper-screenshot.jpeg' },
  { id: 'linkedin-banner', file: 'linkedin-banner-screenshot.png' },
  { id: 'win95-arch', file: 'win95-screenshot.png' },
  { id: 'previsit', file: 'previsit-screenshot.jpeg' },
  { id: 'stani-hoxhes', file: 'stani-screenshot.jpeg' },
];

// Nearest-neighbor downsample to a fixed target width, preserving aspect
// ratio — the dithered output is a small LCD thumbnail, not a full image.
export function downsample(image, targetWidth) {
  const scale = targetWidth / image.width;
  const targetHeight = Math.max(1, Math.round(image.height * scale));
  const out = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  for (let y = 0; y < targetHeight; y += 1) {
    const sy = Math.min(image.height - 1, Math.floor(y / scale));
    for (let x = 0; x < targetWidth; x += 1) {
      const sx = Math.min(image.width - 1, Math.floor(x / scale));
      const srcIdx = (sy * image.width + sx) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      out[dstIdx] = image.data[srcIdx];
      out[dstIdx + 1] = image.data[srcIdx + 1];
      out[dstIdx + 2] = image.data[srcIdx + 2];
      out[dstIdx + 3] = image.data[srcIdx + 3];
    }
  }
  return { width: targetWidth, height: targetHeight, data: out };
}

export function toGrayscale({ width, height, data }) {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

// Classic Atkinson error diffusion: distributes 6/8 of each pixel's
// quantization error to 6 neighbors (1/8 each) and discards the rest —
// that partial diffusion is what gives Atkinson its lighter, higher-
// contrast look versus full-diffusion algorithms like Floyd-Steinberg.
// Mutates `gray` in place. Returns a same-length Uint8Array: 0 = ink, 1 = clear.
export function atkinsonDither(gray, width, height) {
  const bits = new Uint8Array(width * height);
  const NEIGHBORS = [
    [1, 0], [2, 0],
    [-1, 1], [0, 1], [1, 1],
    [0, 2],
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const old = gray[i];
      const newVal = old < THRESHOLD ? 0 : 255;
      bits[i] = newVal === 0 ? 0 : 1;
      const error = (old - newVal) / 8;
      NEIGHBORS.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny >= height) return;
        gray[ny * width + nx] += error;
      });
    }
  }
  return bits;
}

// Renders the 1-bit result as --ink on transparent, meant to be composited
// over the LCD background color in CSS rather than baked with a fixed bg.
export function toInkRgba(bits) {
  const rgba = new Uint8ClampedArray(bits.length * 4);
  for (let i = 0; i < bits.length; i += 1) {
    const o = i * 4;
    if (bits[i] === 0) {
      rgba[o] = INK.r;
      rgba[o + 1] = INK.g;
      rgba[o + 2] = INK.b;
      rgba[o + 3] = 255;
    } else {
      rgba[o + 3] = 0;
    }
  }
  return rgba;
}

export const DITHER_INK = INK;
export const DITHER_THRESHOLD = THRESHOLD;
