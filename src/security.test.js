import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

function getVercelHeaders() {
  const path = join(ROOT, 'vercel.json');
  if (!existsSync(path)) return [];
  const config = JSON.parse(readFileSync(path, 'utf8'));
  return config.headers?.[0]?.headers ?? [];
}

describe('vercel.json security headers', () => {
  it('vercel.json exists at project root', () => {
    expect(existsSync(join(ROOT, 'vercel.json'))).toBe(true);
  });

  it('has X-Content-Type-Options: nosniff', () => {
    const h = getVercelHeaders().find(h => h.key === 'X-Content-Type-Options');
    expect(h?.value).toBe('nosniff');
  });

  // SAMEORIGIN (not DENY) is intentional: ResumeViewer embeds cv.html/PDF in a
  // same-origin <iframe>. DENY would blank that viewer. Cross-origin framing is
  // still blocked, so clickjacking protection holds. See commit 6298845.
  it('has X-Frame-Options: SAMEORIGIN', () => {
    const h = getVercelHeaders().find(h => h.key === 'X-Frame-Options');
    expect(h?.value).toBe('SAMEORIGIN');
  });

  it('has Strict-Transport-Security with max-age', () => {
    const h = getVercelHeaders().find(h => h.key === 'Strict-Transport-Security');
    expect(h?.value).toMatch(/max-age=\d+/);
  });

  it('has Content-Security-Policy header', () => {
    const h = getVercelHeaders().find(h => h.key === 'Content-Security-Policy');
    expect(h?.value).toBeTruthy();
  });

  it('has Referrer-Policy header', () => {
    const h = getVercelHeaders().find(h => h.key === 'Referrer-Policy');
    expect(h?.value).toBeTruthy();
  });

  it('has Permissions-Policy header', () => {
    const h = getVercelHeaders().find(h => h.key === 'Permissions-Policy');
    expect(h?.value).toBeTruthy();
  });
});

describe('the CSP and index.html are one decision, not two', () => {
  const scriptSrc = () => {
    const csp = getVercelHeaders().find(h => h.key === 'Content-Security-Policy');
    return csp?.value.match(/script-src([^;]*)/)?.[1] ?? '';
  };

  // The font stylesheet is loaded as a preload and swapped to a stylesheet by
  // an inline `onload=` attribute, which is the only reason it does not block
  // the first paint. An event-handler attribute is script as far as CSP is
  // concerned, and 'unsafe-inline' is the only thing that permits one: the
  // moment a nonce appears in script-src, browsers stop honouring
  // 'unsafe-inline' for handler attributes and the swap dies silently — the
  // page keeps the preload and never gets the fonts. So tightening this header
  // means deleting that attribute first, and this test is where that is
  // written down.
  it('keeps script-src permissive while index.html swaps the fonts inline', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
    expect(
      html,
      'the inline font swap is gone — take this coupling out and tighten script-src',
    ).toMatch(/onload="this\.onload=null;this\.rel='stylesheet'"/);

    expect(scriptSrc()).toContain("'unsafe-inline'");
    expect(scriptSrc(), 'a nonce here would silently kill the font swap').not.toMatch(
      /'nonce-/,
    );
  });
});
