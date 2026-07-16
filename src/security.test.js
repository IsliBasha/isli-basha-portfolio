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
