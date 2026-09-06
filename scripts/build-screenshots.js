/**
 * Regenerates the project preview images the explorer's detail pane shows,
 * one WebP in `public/` per captured screenshot in `assets/screenshots/`.
 *
 * The captures themselves are JPEG and PNG and stay out of `public/`: they are
 * sources, not shipped files. Two things read them — this script and
 * `dither-screenshots.js`, which grinds the same pictures into the Nokia
 * port's 1-bit thumbnails — and neither wants the browser downloading a
 * 131 KB JPEG when a 20 KB WebP of the same picture will do.
 *
 * Run by hand, not from `prebuild`: the outputs are committed, the captures
 * change only when a project does, and the encoder is not a dependency of this
 * repo (see scripts/webp.js). Wiring it into every build would make
 * `npm run build` fail on a machine that has no encoder, for no gain.
 *
 *   node scripts/build-screenshots.js
 *
 * On a machine with neither cwebp nor sharp, point it at a Playwright install:
 *
 *   SCREENSHOT_PLAYWRIGHT=~/.claude/tools/screenshot/node_modules/playwright \
 *     node scripts/build-screenshots.js
 */
import { readFileSync, statSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SOURCES, SOURCE_DIR } from './dither.js';
import { encodeWebp, readWebpSize } from './webp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SOURCE_ROOT = path.join(ROOT, SOURCE_DIR);

const QUALITY = 80;

// A preview fills a 210x140 pane. Anything over this is a capture that should
// have been cropped or scaled before it was committed, not a quality setting
// to argue with.
const MAX_BYTES = 60 * 1024;

/** `medt-screenshot.jpeg` -> `medt-screenshot.webp`, the name projects.js uses. */
export function webpNameFor(file) {
  return `${path.basename(file, path.extname(file))}.webp`;
}

async function main() {
  let before = 0;
  let after = 0;

  for (const { id, file } of SOURCES) {
    const source = path.join(SOURCE_ROOT, file);
    if (!existsSync(source)) {
      throw new Error(`[screenshots] source missing for "${id}": ${SOURCE_DIR}/${file}`);
    }
    const out = path.join(PUBLIC_DIR, webpNameFor(file));
    // Encoded beside the output and moved in only once both checks below pass.
    // Encoding straight to the committed name meant a run that printed "Not
    // shipping it" had already shipped it: the file was on disk under that
    // name, and the next `git add -A` took it, exit code 1 or not.
    const tmp = `${out}.tmp`;

    try {
      const encoder = await encodeWebp({
        source,
        out: tmp,
        quality: QUALITY,
        playwright: process.env.SCREENSHOT_PLAYWRIGHT,
      });

      const sourceBytes = statSync(source).size;
      const bytes = readFileSync(tmp);
      const size = readWebpSize(bytes);

      console.log(
        `[screenshots] ${webpNameFor(file)}  ` +
          `${size ? `${size.width}x${size.height}` : 'size unreadable'} q${QUALITY} ` +
          `via ${encoder}  ${(bytes.length / 1024).toFixed(1)} KB ` +
          `(was ${(sourceBytes / 1024).toFixed(1)} KB)`,
      );
      // Both of these used to be a line on the terminal and an exit code of 0,
      // which in a script whose whole job is to write files that get committed
      // means "shipped it anyway". A run that produced something it would not
      // sign off has to say so in the only channel anything downstream reads.
      let shipping = true;
      if (!size) {
        console.error(
          `[screenshots] ${webpNameFor(file)} carries no readable WebP header — ` +
            'the encoder wrote something else under that name. Not shipping it.',
        );
        process.exitCode = 1;
        shipping = false;
      }
      if (bytes.length > MAX_BYTES) {
        console.error(
          `[screenshots] ${webpNameFor(file)} is over the ${MAX_BYTES / 1024} KB ` +
            'budget — crop or scale the capture rather than shipping it.',
        );
        process.exitCode = 1;
        shipping = false;
      }
      // Counted only if it ships, so the summary below cannot claim a file
      // the checks just refused.
      if (shipping) {
        renameSync(tmp, out);
        before += sourceBytes;
        after += bytes.length;
      }
    } finally {
      // Nothing to remove after a rename, and a half-written file to remove
      // after a throw from inside the encoder.
      if (existsSync(tmp)) unlinkSync(tmp);
    }
  }

  console.log(
    `[screenshots] ${SOURCES.length} previews: ` +
      `${(before / 1024).toFixed(1)} KB of captures -> ${(after / 1024).toFixed(1)} KB shipped`,
  );
}

main().catch((error) => {
  // The whole error, not error.message: half of what can go wrong here is a
  // decoder throwing from three frames down, and the stack is the only part
  // of that which says where.
  console.error('[screenshots] failed:', error);
  process.exitCode = 1;
});
