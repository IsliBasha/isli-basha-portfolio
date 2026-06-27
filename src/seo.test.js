import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const indexHtml = () => readFileSync(join(ROOT, 'index.html'), 'utf8');

describe('index.html OG / social meta tags', () => {
  it('has og:title', () => {
    expect(indexHtml()).toMatch(/property="og:title"/);
  });

  it('has og:description', () => {
    expect(indexHtml()).toMatch(/property="og:description"/);
  });

  it('has og:image pointing to screenshot.png', () => {
    expect(indexHtml()).toMatch(/property="og:image"/);
    expect(indexHtml()).toMatch(/screenshot\.png/);
  });

  it('has og:url pointing to islibasha.dev', () => {
    expect(indexHtml()).toMatch(/property="og:url"/);
    expect(indexHtml()).toMatch(/islibasha\.dev/);
  });

  it('has twitter:card meta tag', () => {
    expect(indexHtml()).toMatch(/name="twitter:card"/);
  });

  it('has canonical link to islibasha.dev', () => {
    expect(indexHtml()).toMatch(/rel="canonical"/);
    expect(indexHtml()).toMatch(/islibasha\.dev/);
  });
});

describe('public/ SEO files', () => {
  it('robots.txt exists', () => {
    expect(existsSync(join(ROOT, 'public', 'robots.txt'))).toBe(true);
  });

  it('robots.txt contains Sitemap directive', () => {
    expect(readFileSync(join(ROOT, 'public', 'robots.txt'), 'utf8')).toMatch(/Sitemap:/);
  });

  it('robots.txt allows all crawlers', () => {
    expect(readFileSync(join(ROOT, 'public', 'robots.txt'), 'utf8')).toMatch(/Allow: \//);
  });

  it('sitemap.xml exists', () => {
    expect(existsSync(join(ROOT, 'public', 'sitemap.xml'))).toBe(true);
  });

  it('sitemap.xml contains islibasha.dev URL', () => {
    expect(readFileSync(join(ROOT, 'public', 'sitemap.xml'), 'utf8')).toMatch(/islibasha\.dev/);
  });
});
