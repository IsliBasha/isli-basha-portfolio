import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import {
  downsample,
  toGrayscale,
  atkinsonDither,
  toInkRgba,
  SOURCES,
  SOURCE_DIR,
} from './dither.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SOURCE_ROOT = path.join(ROOT, SOURCE_DIR);
const OUT_DIR = path.join(PUBLIC_DIR, 'nokia');

const TARGET_WIDTH = 240;

function decodeImage(filePath) {
  const buffer = readFileSync(filePath);
  if (filePath.toLowerCase().endsWith('.png')) {
    const png = PNG.sync.read(buffer);
    return { width: png.width, height: png.height, data: png.data };
  }
  const { width, height, data } = jpeg.decode(buffer, { useTArray: true });
  return { width, height, data };
}

function toPngBuffer(rgba, width, height) {
  const png = new PNG({ width, height });
  png.data = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength);
  return PNG.sync.write(png);
}

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  SOURCES.forEach(({ id, file }) => {
    const srcPath = path.join(SOURCE_ROOT, file);
    if (!existsSync(srcPath)) {
      // A listed source going missing means SOURCES has drifted from what is
      // actually in assets/screenshots/ — fail the build loudly rather than
      // silently shipping a project page whose <img> 404s.
      throw new Error(
        `[dither] source missing for "${id}": ${SOURCE_DIR}/${file} not found`,
      );
    }
    const decoded = decodeImage(srcPath);
    const small = downsample(decoded, TARGET_WIDTH);
    const gray = toGrayscale(small);
    const bits = atkinsonDither(gray, small.width, small.height);
    const rgba = toInkRgba(bits);
    const outBuffer = toPngBuffer(rgba, small.width, small.height);
    const outPath = path.join(OUT_DIR, `${id}.png`);
    writeFileSync(outPath, outBuffer);
    console.log(
      `[dither] ${SOURCE_DIR}/${file} -> nokia/${id}.png (${small.width}x${small.height})`,
    );
  });
}

main();
