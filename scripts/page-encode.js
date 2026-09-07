/**
 * The page-side half of the Chromium canvas encoder in webp.js. Browser
 * source, not Node source, which is the whole reason it is a file of its own:
 * ESLint has no callback scoping, so an inline `global Image, document`
 * comment beside the page.evaluate() call declared both for every other line
 * of a build script that runs on Node -- including the lines where reaching
 * for `document` really is the bug no-undef exists to catch. eslint.config.js
 * lints scripts/page-*.js with the browser globals and without the Node ones.
 *
 * Playwright serialises this with Function.prototype.toString() and evaluates
 * the source inside the page, so it must close over nothing: everything it
 * needs arrives in the one argument, and nothing it could import would exist
 * on the other side.
 */

/**
 * Draw `src` into a canvas and re-encode it as `wanted` at `quality` (0..1),
 * returning the base64 payload of the resulting data URL.
 */
export async function encodeInPage([src, wanted, quality]) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext('2d').drawImage(img, 0, 0);
  const url = canvas.toDataURL(wanted, quality);
  // A browser that cannot encode the format asked for quietly returns a PNG
  // data URL instead of failing, which would write a 2 MB PNG under a .webp
  // or .jpg name.
  if (!url.startsWith(`data:${wanted}`)) {
    throw new Error('this browser encoded ' + url.slice(5, 20) + ', not ' + wanted);
  }
  return url.slice(url.indexOf(',') + 1);
}
