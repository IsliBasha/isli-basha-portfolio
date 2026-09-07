/**
 * Rebuilds `public/screenshot.jpg`, the picture Slack, LinkedIn and the
 * Twitter card show when the site is pasted somewhere, from the same 1280x800
 * capture the README embeds (`screenshot.png` at the repo root).
 *
 * It is a separate file from the README's copy because the two have different
 * jobs. The README is read on GitHub, where a lossless PNG of a pixel-art
 * desktop is exactly right. An og:image is fetched by crawlers and re-encoded
 * by half of them anyway, and 517 KB of PNG for a preview card is three times
 * what the same picture costs as a JPEG.
 *
 * Run by hand, not from `prebuild`: the output is committed, the capture
 * changes only when the desktop does, and neither encoder below is a
 * dependency of this repo — the same arrangement build-wallpapers.js and
 * build-screenshots.js are under (see scripts/webp.js).
 *
 *   node scripts/build-og-image.js
 *
 * On a machine with no sharp, point it at a Playwright install:
 *
 *   OG_PLAYWRIGHT=~/.claude/tools/screenshot/node_modules/playwright \
 *     node scripts/build-og-image.js
 */
import { readFileSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { encodeWithChromiumCanvas, importFailureReport, tryImport } from './webp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'screenshot.png');
const OUT = path.join(ROOT, 'public', 'screenshot.jpg');

// High enough that the 1px window bevels and the Silkscreen labels do not ring.
// This capture is a hard case for JPEG: a photographic sky behind crisp
// chrome, so it does not reach the 120 KB a flatter screenshot would.
const QUALITY = 85;

// Just above what the current capture encodes to, so a recapture that balloons
// says so rather than quietly doubling what every crawler downloads.
const MAX_BYTES = 200 * 1024;

/**
 * The dimensions a JPEG actually carries, read back off its frame header.
 *
 * Reported rather than trusted, for the same reason readWebpSize exists: two
 * encoders are two chances for the output to be something other than the
 * picture that went in, and this is also the check that the file is a JPEG at
 * all rather than a PNG written under a .jpg name.
 */
export function readJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    // SOF0..SOF15 carry the frame header; 0xc4, 0xc8 and 0xcc sit in that
    // range and are DHT, JPG and DAC, which do not.
    const isFrameHeader =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrameHeader) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

/**
 * Encode the capture to JPEG with whichever encoder the machine has, and
 * return the name of the one that did it.
 *
 * No pure-JS fallback on purpose. jpeg-js is already a devDependency here and
 * would always resolve, but it writes this picture at 254 KB against
 * Chromium's 175 KB at the same quality — a silent 45% regression on the one
 * file this script exists to keep small. Failing with instructions is better
 * than overwriting a good output with a worse one.
 */
async function encodeJpeg(out) {
  const sharp = await tryImport('sharp');
  if (sharp) {
    // `.jpeg()` is explicit, so the format does not come from the extension --
    // which matters because `out` is a .tmp until the checks below pass.
    await sharp.default(SOURCE).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(out);
    return 'sharp';
  }

  const playwright = await tryImport(process.env.OG_PLAYWRIGHT ?? 'playwright');
  if (playwright) {
    await encodeWithChromiumCanvas(playwright, {
      source: SOURCE,
      out,
      mime: 'image/jpeg',
      quality: QUALITY,
    });
    return 'chromium canvas';
  }

  const failures = importFailureReport();
  throw new Error(
    'no JPEG encoder found. Install one of:\n' +
      '  npm i -D sharp         (~30 MB of platform binaries)\n' +
      'or point the script at a Playwright install with OG_PLAYWRIGHT.\n' +
      'The output is committed, so this is only needed to regenerate it.' +
      (failures ? `\nWhat each import said, in case one of these is installed but broken:\n${failures}` : ''),
  );
}

async function main() {
  if (!existsSync(SOURCE)) {
    throw new Error(`source capture missing: ${path.relative(ROOT, SOURCE)}`);
  }
  const sourceBytes = readFileSync(SOURCE).length;

  // Encoded beside the output and moved in only once both checks below pass.
  // Encoding straight to public/screenshot.jpg meant a run that printed "Not
  // shipping it" had already shipped it: the file was on disk under the
  // committed name, and the next `git add -A` took it, exit code 1 or not.
  const tmp = `${OUT}.tmp`;
  try {
    const encoder = await encodeJpeg(tmp);
    const bytes = readFileSync(tmp);
    const size = readJpegSize(bytes);

    console.log(
      `[og] screenshot.jpg  ${size ? `${size.width}x${size.height}` : 'size unreadable'} ` +
        `q${QUALITY} via ${encoder}  ${(bytes.length / 1024).toFixed(1)} KB ` +
        `(was ${(sourceBytes / 1024).toFixed(1)} KB as PNG)`,
    );

    let shipping = true;
    if (!size) {
      console.error(
        '[og] screenshot.jpg carries no readable JPEG frame header — the encoder ' +
          'wrote something else under that name. Not shipping it.',
      );
      process.exitCode = 1;
      shipping = false;
    }
    if (bytes.length > MAX_BYTES) {
      console.error(
        `[og] screenshot.jpg is over the ${MAX_BYTES / 1024} KB budget — drop the ` +
          'quality or recapture at a smaller size rather than shipping it.',
      );
      process.exitCode = 1;
      shipping = false;
    }
    if (shipping) renameSync(tmp, OUT);
  } finally {
    // Nothing to remove after a rename, and a half-written file to remove
    // after a throw from inside the encoder.
    if (existsSync(tmp)) unlinkSync(tmp);
  }
}

main().catch((error) => {
  // The whole error, not error.message: half of what can go wrong here is a
  // decoder throwing from three frames down, and the stack is the only part
  // of that which says where.
  console.error('[og] failed:', error);
  process.exitCode = 1;
});
