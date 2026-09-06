/**
 * WebP encoding for the two build scripts that need it: build-wallpapers.js
 * (the desktop photograph) and build-screenshots.js (the project previews).
 *
 * Extracted from build-wallpapers.js when the second caller arrived, so there
 * is one encoder ladder to keep working rather than two that drift.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { encodeInPage } from './page-encode.js';

const MIME_BY_EXTENSION = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

// Why each optional encoder was not there, in the order they were tried. An
// encoder that is installed but broken -- a sharp whose platform binary does
// not match the running Node, most often -- throws from the import exactly
// like one that was never installed, and a ladder that only reports "found
// nothing" sends the reader off to reinstall what they already have.
const importFailures = [];

/**
 * The reasons the optional encoders did not resolve, one indented line each,
 * or '' if nothing was tried. First line of each error only: sharp's runs to
 * a paragraph, and the first line is the part that names the problem.
 */
export function importFailureReport() {
  return importFailures
    .map(({ specifier, message }) => `  ${specifier}: ${message.split('\n')[0]}`)
    .join('\n');
}

/** Resolve an optional encoder without making it a dependency. */
export async function tryImport(specifier) {
  try {
    return await import(specifier);
  } catch {
    // SCREENSHOT_PLAYWRIGHT / WALLPAPER_PLAYWRIGHT is a directory path, and
    // ESM does not do directory or package-entry resolution on one -- only
    // require() does. Playwright is CommonJS regardless, so this is the path
    // that actually resolves it.
    try {
      return createRequire(import.meta.url)(specifier);
    } catch (requireError) {
      // Recorded, not thrown: the ladder is meant to fall through to the next
      // encoder, and only the caller that runs out of them has anything to
      // report. The require() error is kept rather than the import() one
      // because require is the resolver that got the final say.
      importFailures.push({
        specifier: String(specifier),
        message: requireError?.message ?? String(requireError),
      });
      return null;
    }
  }
}

function hasCommand(name) {
  try {
    execFileSync('which', [name], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Encode one image to WebP with whichever encoder the machine has, and return
 * the name of the one that did it.
 *
 * Three paths, best first. Neither of the first two is a dependency of this
 * repo: `cwebp` ships with libwebp (`brew install webp`) and `sharp` is a
 * ~30 MB install of per-platform binaries that nothing at runtime or in the
 * test suite needs. macOS `sips` is deliberately not tried -- ImageIO reads
 * WebP but cannot write it ("Can't write format: org.webmproject.webp").
 *
 * The third is a headless Chromium canvas, and on a machine with neither of
 * the others it is the one that runs. Playwright is already here for
 * screenshots and its canvas encoder is the same libwebp underneath. It is
 * last because it spends a browser launch on one image, and because Playwright
 * is resolved from outside this repo, so a bare import may not find it -- pass
 * `playwright` as a path in that case.
 *
 * `resize` is honoured by cwebp and sharp only: the canvas path draws the
 * source at its natural size. Both current callers either pass the source's
 * own dimensions or nothing at all, so no encoder produces a different
 * picture from another -- do not add a real resize without checking that.
 */
export async function encodeWebp({ source, out, quality, resize, playwright }) {
  if (hasCommand('cwebp')) {
    const args = ['-q', String(quality)];
    if (resize) args.push('-resize', String(resize[0]), String(resize[1]));
    // `--` last, and the source right after it: cwebp reads `--` as "the next
    // argument is the input file" and then stops parsing, so anything past it
    // is dropped -- `-o` included. This is what keeps a capture named
    // `-resize.png` from being read as a flag, without silently losing the
    // output path to it.
    args.push('-o', out, '--', source);
    // cwebp writes its progress and its complaints to stderr. Inherited, so a
    // failed encode says why on this terminal instead of disappearing into an
    // ignored pipe; stdout stays quiet because it is only the banner.
    execFileSync('cwebp', args, { stdio: ['ignore', 'ignore', 'inherit'] });
    return 'cwebp';
  }

  const sharp = await tryImport('sharp');
  if (sharp) {
    let pipeline = sharp.default(source);
    if (resize) pipeline = pipeline.resize(resize[0], resize[1]);
    await pipeline.webp({ quality }).toFile(out);
    return 'sharp';
  }

  const chromium = await tryImport(playwright ?? 'playwright');
  if (chromium) {
    await encodeWithChromiumCanvas(chromium, {
      source,
      out,
      mime: 'image/webp',
      quality,
    });
    return 'chromium canvas';
  }

  const failures = importFailureReport();
  throw new Error(
    'no WebP encoder found. Install one of:\n' +
      '  brew install webp      (gives you cwebp, ~2 MB, preferred)\n' +
      '  npm i -D sharp         (~30 MB of platform binaries)\n' +
      'or point the script at a Playwright install.\n' +
      'The WebP outputs are committed, so this is only needed to regenerate them.' +
      (failures ? `\nWhat each import said, in case one of these is installed but broken:\n${failures}` : ''),
  );
}

/**
 * Re-encode `source` to `mime` through a headless Chromium canvas.
 *
 * Exported because it is not WebP-specific: build-og-image.js re-encodes the
 * OG capture to JPEG through the same browser, and Chromium's libjpeg-turbo
 * is a good deal better at a UI screenshot than the pure-JS encoders this repo
 * already depends on.
 */
export async function encodeWithChromiumCanvas(playwright, { source, out, mime, quality }) {
  const { chromium } = playwright.chromium ? playwright : playwright.default;
  const extension = path.extname(source).toLowerCase();
  const sourceMime = MIME_BY_EXTENSION[extension];
  if (!sourceMime) throw new Error(`cannot read ${extension} into a canvas`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const dataUrl = `data:${sourceMime};base64,${readFileSync(source).toString('base64')}`;
    // encodeInPage lives in its own module because ESLint's `global` comments
    // are file-scoped: declaring Image and document here would have declared
    // them for the Node half of this file too. Playwright serialises the
    // function source either way, so where it is written makes no difference
    // to what runs in the page.
    const encoded = await page.evaluate(encodeInPage, [dataUrl, mime, quality / 100]);
    writeFileSync(out, Buffer.from(encoded, 'base64'));
  } finally {
    await browser.close();
  }
}

/**
 * The dimensions a WebP file actually carries, read back off the bytes.
 *
 * Reported instead of the numbers the caller asked for, because `-resize` and
 * a canvas both round, and three encoders are three chances for the output to
 * be something other than what was requested. Simple lossy files carry the
 * size in the VP8 frame header, lossless in VP8L's first bits, and anything
 * with alpha or metadata in the VP8X canvas header.
 */
export function readWebpSize(buffer) {
  if (
    buffer.length < 16 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    return null;
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = buffer.subarray(offset + 8, offset + 8 + size);

    if (type === 'VP8X' && body.length >= 10) {
      return {
        width: (body[4] | (body[5] << 8) | (body[6] << 16)) + 1,
        height: (body[7] | (body[8] << 8) | (body[9] << 16)) + 1,
      };
    }
    if (type === 'VP8 ' && body.length >= 10) {
      // 3-byte frame tag, the 0x9d 0x01 0x2a start code, then 14-bit sizes.
      return {
        width: body.readUInt16LE(6) & 0x3fff,
        height: body.readUInt16LE(8) & 0x3fff,
      };
    }
    if (type === 'VP8L' && body.length >= 5) {
      const bits = body.readUInt32LE(1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    // RIFF chunks are padded to an even length; the pad byte is not counted
    // in the size field, and skipping it desynchronises every chunk after.
    offset += 8 + size + (size % 2);
  }
  return null;
}
