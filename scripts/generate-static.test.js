import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  generate,
  renderIndexList,
  renderIndexBio,
  renderLlmsBio,
  renderLlmsSections,
  summarise,
  applyBlock,
} from './generate-static.js';
import { projects } from '../src/data/projects.js';
import { identity } from '../src/data/identity.js';

const ROOT = join(import.meta.dirname, '..');

describe('generate-static', () => {
  // The guard that makes one-source-of-truth real: if someone edits
  // src/data/projects.js and forgets `npm run static`, this fails.
  it('index.html and llms.txt are in sync with the project data', () => {
    expect(generate({ check: true })).toEqual([]);
  });

  it('lists every project in the crawler snapshot', () => {
    const html = renderIndexList(projects);
    for (const p of projects) {
      expect(html, `${p.id} missing from index list`).toContain(p.name);
    }
    expect(html.split('\n')).toHaveLength(projects.length);
  });

  it('links public projects and labels private ones instead of emitting a dead anchor', () => {
    const html = renderIndexList(projects);
    const ecovolt = projects.find((p) => p.id === 'ecovolt');
    expect(html).toContain(`<em>(${ecovolt.privateNote})</em>`);
    expect(html).not.toContain('href="undefined"');
    expect(html).not.toContain('href=""');
  });

  it('escapes HTML-significant characters in descriptions', () => {
    const html = renderIndexList([
      { ...projects[0], name: 'A & B', description: 'Uses <script> tags. Second.' },
    ]);
    expect(html).toContain('A &amp; B');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('groups llms.txt by category with every project accounted for', () => {
    const md = renderLlmsSections(projects);
    for (const p of projects) {
      expect(md, `${p.id} missing from llms.txt`).toContain(p.name);
    }
    expect(md).toContain('## Professional work');
  });

  // Retrieval lifts passages, not pages. An answer that only parses after
  // reading the one above it gets dropped, so each must name the subject.
  describe('crawler-visible bio', () => {
    it('names the person in every answer rather than relying on context', () => {
      for (const item of identity.answers) {
        const namesSubject = /Isli Basha|\bhe\b|\bhis\b/i.test(item.a);
        expect(namesSubject, `answer "${item.q}" has no subject`).toBe(true);
      }
    });

    it('states the role and the city in the summary itself', () => {
      expect(identity.summary).toMatch(/Tirana/);
      expect(identity.summary).toMatch(/Albania/);
      expect(identity.summary).toMatch(/software engineer/i);
    });

    it('renders every answer into the index snapshot', () => {
      const html = renderIndexBio();
      for (const item of identity.answers) {
        expect(html).toContain(item.q.replace(/&/g, '&amp;'));
      }
    });

    it('escapes the bio the same way the project list is escaped', () => {
      expect(renderIndexBio()).not.toMatch(/(?<!&amp;)&(?!amp;|mdash;|lt;|gt;)/);
    });

    it('renders llms.txt answers as markdown headings', () => {
      const md = renderLlmsBio();
      expect(md).toMatch(/^## About/m);
      for (const item of identity.answers) expect(md).toContain(`### ${item.q}`);
    });
  });

  describe('summarise', () => {
    it('extends a short opening sentence with the next one', () => {
      expect(summarise('Short one. A considerably longer follow-up sentence here.')).toBe(
        'Short one. A considerably longer follow-up sentence here',
      );
    });

    it('stops at one sentence when that is already substantial', () => {
      const long = 'A'.repeat(80);
      expect(summarise(`${long}. Trailing sentence.`)).toBe(long);
    });

    it('drops the trailing full stop', () => {
      expect(summarise('Just this.')).not.toMatch(/\.$/);
    });
  });

  describe('applyBlock', () => {
    it('replaces only the body between the markers', () => {
      const src = 'keep\n<!-- projects:start -->\nold\n<!-- projects:end -->\nkeep too\n';
      const out = applyBlock(src, 'new');
      expect(out).toContain('keep\n');
      expect(out).toContain('keep too');
      expect(out).toContain('new');
      expect(out).not.toContain('old');
    });

    it('throws when the markers are missing rather than silently writing nothing', () => {
      expect(() => applyBlock('no markers here', 'body')).toThrow(/markers/);
    });
  });

  it('leaves the hand-written parts of both files untouched', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
    expect(html).toContain('<h2>Selected projects</h2>');
    expect(html).toContain('Windows&nbsp;95 desktop simulation');

    const llms = readFileSync(join(ROOT, 'public', 'llms.txt'), 'utf8');
    expect(llms).toContain('# Isli Basha');
    expect(llms).toContain('## Profile');
  });
});
