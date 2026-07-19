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

describe('index.html title and description quality', () => {
  it('title is at least 45 characters', () => {
    const m = indexHtml().match(/<title>(.*?)<\/title>/);
    expect(m).not.toBeNull();
    expect(m[1].length).toBeGreaterThanOrEqual(45);
  });

  it('meta description is at least 100 characters', () => {
    const m = indexHtml().match(/name="description"[^>]*content="([^"]+)"/);
    expect(m).not.toBeNull();
    expect(m[1].length).toBeGreaterThanOrEqual(100);
  });
});

describe('index.html JSON-LD structured data', () => {
  it('has a JSON-LD script block', () => {
    expect(indexHtml()).toMatch(/type="application\/ld\+json"/);
  });

  it('JSON-LD declares @type Person', () => {
    expect(indexHtml()).toMatch(/"@type"\s*:\s*"Person"/);
  });

  it('JSON-LD includes jobTitle', () => {
    expect(indexHtml()).toMatch(/"jobTitle"/);
  });

  it('JSON-LD includes GitHub sameAs', () => {
    expect(indexHtml()).toMatch(/github\.com\/IsliBasha/);
  });
});

describe('index.html noscript fallback', () => {
  it('has a noscript block', () => {
    expect(indexHtml()).toMatch(/<noscript>/);
  });

  it('noscript contains h1 with name', () => {
    expect(indexHtml()).toMatch(/Isli Basha/);
  });
});

describe('cv.html SEO', () => {
  const cvHtml = () => readFileSync(join(ROOT, 'public', 'cv.html'), 'utf8');

  it('has a meta description', () => {
    expect(cvHtml()).toMatch(/name="description"/);
  });

  it('meta description is at least 80 characters', () => {
    const m = cvHtml().match(/name="description"[^>]*content="([^"]+)"/);
    expect(m).not.toBeNull();
    expect(m[1].length).toBeGreaterThanOrEqual(80);
  });

  it('has a canonical link', () => {
    expect(cvHtml()).toMatch(/rel="canonical"/);
  });

  it('has og:title', () => {
    expect(cvHtml()).toMatch(/property="og:title"/);
  });
});

describe('sitemap.xml completeness', () => {
  const sitemap = () => readFileSync(join(ROOT, 'public', 'sitemap.xml'), 'utf8');

  it('includes cv.html in the sitemap', () => {
    expect(sitemap()).toMatch(/cv\.html/);
  });
});

describe('robots.txt AI crawler access', () => {
  const robots = () => readFileSync(join(ROOT, 'public', 'robots.txt'), 'utf8');

  it('explicitly allows GPTBot', () => {
    expect(robots()).toMatch(/User-agent: GPTBot\s+Allow: \//);
  });

  it('explicitly allows OAI-SearchBot', () => {
    expect(robots()).toMatch(/User-agent: OAI-SearchBot\s+Allow: \//);
  });

  it('explicitly allows ClaudeBot', () => {
    expect(robots()).toMatch(/User-agent: ClaudeBot\s+Allow: \//);
  });

  it('explicitly allows PerplexityBot', () => {
    expect(robots()).toMatch(/User-agent: PerplexityBot\s+Allow: \//);
  });
});

describe('llms.txt for AI assistants', () => {
  const llms = () => readFileSync(join(ROOT, 'public', 'llms.txt'), 'utf8');

  it('exists in public/', () => {
    expect(existsSync(join(ROOT, 'public', 'llms.txt'))).toBe(true);
  });

  it('starts with an H1 of the site owner name', () => {
    expect(llms()).toMatch(/^# Isli Basha/);
  });

  it('describes the agent and automation specialisation', () => {
    expect(llms()).toMatch(/[Aa]gent/);
    expect(llms()).toMatch(/[Aa]utomation/);
  });

  it('mentions Tirana, Albania', () => {
    expect(llms()).toMatch(/Tirana/);
  });

  it('links to the GitHub profile', () => {
    expect(llms()).toMatch(/github\.com\/IsliBasha/);
  });
});

describe('index.html prerendered content for non-JS crawlers', () => {
  const rootContent = () => {
    const m = indexHtml().match(/<div id="root">([\s\S]*?)<\/div>\s*<script/);
    return m ? m[1] : '';
  };

  it('has static content inside #root', () => {
    expect(rootContent()).toMatch(/Isli Basha/);
  });

  it('static content names the agent and automation role', () => {
    expect(rootContent()).toMatch(/Automation Specialist/);
  });

  it('static content links real project repos', () => {
    expect(rootContent()).toMatch(/github\.com\/IsliBasha\/rust-scraper/);
    expect(rootContent()).toMatch(/github\.com\/IsliBasha\/publer-mcp/);
  });
});

describe('index.html JSON-LD location and education', () => {
  it('Person includes a Tirana address', () => {
    expect(indexHtml()).toMatch(/"addressLocality"\s*:\s*"Tirana"/);
  });

  it('Person includes alumniOf Polis University', () => {
    expect(indexHtml()).toMatch(/"alumniOf"/);
    expect(indexHtml()).toMatch(/Polis University/);
  });

  it('Person knowsAbout covers the AI-agent niche', () => {
    expect(indexHtml()).toMatch(/AI Agents/);
    expect(indexHtml()).toMatch(/Model Context Protocol/);
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
