import { describe, it, expect } from 'vitest';
import { projects } from './projects.js';
import { SOURCES } from '../../scripts/dither.js';

const VALID_CATEGORIES = ['work', 'web', 'app', 'tool', 'research'];

describe('projects data', () => {
  it('includes the mira-study project', () => {
    const ids = projects.map((p) => p.id);
    expect(ids).toContain('mira-study');
  });

  it('mira-study has a valid GitHub link', () => {
    const p = projects.find((p) => p.id === 'mira-study');
    expect(p).toBeDefined();
    expect(p.link.href).toBe('https://github.com/IsliBasha/mira-study');
  });

  it('mira-study lists PyQt6 in its stack', () => {
    const p = projects.find((p) => p.id === 'mira-study');
    expect(p.stack).toContain('PyQt6');
  });

  it('gives every project a unique id', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only lists a screenshot for projects the dither pipeline actually produces', () => {
    // Cross-checks against scripts/dither.js's SOURCES rather than a
    // hardcoded list, so the two can't silently drift apart.
    const withShot = projects.filter((p) => p.screenshot).map((p) => p.id).sort();
    const ditherIds = SOURCES.map((s) => s.id).sort();
    expect(withShot).toEqual(ditherIds);
  });

  it('points each screenshot field at the exact path the dither pipeline writes', () => {
    for (const p of projects) {
      if (!p.screenshot) continue;
      expect(p.screenshot, `${p.id} screenshot path`).toBe(`/nokia/${p.id}.png`);
    }
  });

  it('all projects have the fields every surface renders', () => {
    for (const p of projects) {
      expect(p.id, `${p.id} missing id`).toBeTruthy();
      expect(p.name, `${p.id} missing name`).toBeTruthy();
      expect(p.description, `${p.id} missing description`).toBeTruthy();
      expect(Array.isArray(p.stack), `${p.id} stack must be array`).toBe(true);
      expect(p.stack.length, `${p.id} stack must not be empty`).toBeGreaterThan(0);
      expect(p.iconType, `${p.id} missing iconType`).toBeTruthy();
      expect(p.icon, `${p.id} missing explorer icon`).toBeTruthy();
      expect(p.tag, `${p.id} missing tag`).toBeTruthy();
      expect(p.type, `${p.id} missing type`).toBeTruthy();
      expect(VALID_CATEGORIES, `${p.id} category`).toContain(p.category);
    }
  });

  // A project either has somewhere real to send a visitor, or it says why it
  // doesn't. The failure this guards against is a card whose button renders
  // with nothing behind it.
  it('every project either has a usable link or explains why it has none', () => {
    for (const p of projects) {
      if (p.link === null) {
        expect(p.privateNote, `${p.id} is linkless and must carry a privateNote`).toBeTruthy();
        continue;
      }
      expect(p.link.href, `${p.id} link.href`).toMatch(/^https:\/\//);
      expect(p.link.label, `${p.id} link.label`).toBeTruthy();
    }
  });

  // Private repos 404 for every visitor who isn't signed in as the owner, so
  // linking one is worse than showing no link at all. These were live on the
  // site: copycat and Coolab_hackathon both point at private repos.
  it('never links a GitHub repo that is known to be private', () => {
    const PRIVATE_REPOS = [
      'IsliBasha/copycat',
      'IsliBasha/Coolab_hackathon',
      'IsliBasha/ecovolt-platform',
      'IsliBasha/previsit-doctor-dashboard',
      'IsliBasha/Software-Testing',
    ];
    for (const p of projects) {
      if (!p.link) continue;
      for (const repo of PRIVATE_REPOS) {
        expect(p.link.href, `${p.id} links private repo ${repo}`).not.toContain(repo);
      }
    }
  });

  // Ofive repos live under a private org; the org name should not leak into a
  // link a visitor could try to open.
  it('routes Ofive work to the company site, never to a private org repo', () => {
    const ofive = projects.filter((p) => p.id.startsWith('ofive-'));
    expect(ofive.length).toBeGreaterThan(0);
    for (const p of ofive) {
      expect(p.link.href, `${p.id}`).toBe('https://ofive.io');
      expect(p.link.href).not.toContain('github.com');
    }
  });
});
