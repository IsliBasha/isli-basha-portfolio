import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildGraph, buildPerson, buildProjects } from './schema-graph.js';
import { identity, IDS } from '../src/data/identity.js';
import { projects } from '../src/data/projects.js';

const ROOT = join(import.meta.dirname, '..');

function ldBlocks(file) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    (m) => m[1],
  );
}

function collectIdRefs(node, into = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => collectIdRefs(n, into));
  else if (node && typeof node === 'object') {
    const keys = Object.keys(node);
    if (keys.length === 1 && keys[0] === '@id') into.add(node['@id']);
    Object.values(node).forEach((v) => collectIdRefs(v, into));
  }
  return into;
}

describe('schema graph', () => {
  // An HTML comment inside a ld+json block makes it invalid JSON and every
  // consumer fails closed. This is the regression that guards the marker
  // placement in generate-static.js.
  it.each(['index.html', 'public/cv.html'])('%s emits parseable JSON-LD', (file) => {
    const blocks = ldBlocks(file);
    expect(blocks.length).toBe(1);
    expect(() => JSON.parse(blocks[0])).not.toThrow();
  });

  it.each(['index.html', 'public/cv.html'])('%s has no dangling @id references', (file) => {
    const graph = JSON.parse(ldBlocks(file)[0])['@graph'];
    const declared = new Set(graph.map((n) => n['@id']).filter(Boolean));
    const dangling = [...collectIdRefs(graph)].filter((id) => !declared.has(id));
    expect(dangling).toEqual([]);
  });

  it('describes exactly one Person, so mentions reconcile to one entity', () => {
    for (const file of ['index.html', 'public/cv.html']) {
      const graph = JSON.parse(ldBlocks(file)[0])['@graph'];
      expect(graph.filter((n) => n['@type'] === 'Person')).toHaveLength(1);
    }
  });

  it('uses the same Person @id on both pages', () => {
    const home = JSON.parse(ldBlocks('index.html')[0])['@graph'];
    const cv = JSON.parse(ldBlocks('public/cv.html')[0])['@graph'];
    const idOf = (g) => g.find((n) => n['@type'] === 'Person')['@id'];
    expect(idOf(home)).toBe(IDS.person);
    expect(idOf(cv)).toBe(IDS.person);
  });

  it('wraps the Person in a ProfilePage via mainEntity', () => {
    const graph = buildGraph({ page: 'home', dateModified: '2026-08-23' })['@graph'];
    const profile = graph.find((n) => n['@type'] === 'ProfilePage');
    expect(profile.mainEntity).toEqual({ '@id': IDS.person });
  });

  // The point of the exercise: "<role> in <place>" as one machine-readable
  // claim, rather than a job title and an address that nothing connects.
  it('pairs every occupation with a resolvable location', () => {
    const person = buildPerson();
    expect(person.hasOccupation.length).toBeGreaterThan(0);
    for (const occ of person.hasOccupation) {
      expect(occ['@type']).toBe('Occupation');
      expect(occ.name).toBeTruthy();
      expect(occ.occupationLocation.name).toBeTruthy();
      expect(occ.occupationLocation.sameAs).toMatch(/wikidata\.org/);
    }
  });

  it('covers both target phrasings: engineer in the city, specialist in the country', () => {
    const occ = buildPerson().hasOccupation;
    const pairs = occ.map((o) => `${o.name} @ ${o.occupationLocation.name}`);
    expect(pairs).toContain('Software Engineer @ Tirana');
    expect(pairs).toContain('Agent & Automation Specialist @ Albania');
  });

  it('expresses topics as linked entities, not bare strings', () => {
    for (const topic of buildPerson().knowsAbout) {
      expect(topic['@type']).toBe('Thing');
      expect(topic.sameAs).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
    }
  });

  // A sameAs pointing at the wrong person breaks disambiguation rather than
  // strengthening it, so the list stays deliberately short and absolute.
  it('only claims absolute https sameAs URLs', () => {
    expect(identity.sameAs.length).toBeGreaterThan(0);
    for (const url of identity.sameAs) expect(url).toMatch(/^https:\/\//);
  });

  it('never marks up a project with no public URL', () => {
    const marked = buildProjects();
    const linkless = projects.filter((p) => !p.link).map((p) => p.name);
    for (const node of marked) {
      expect(node.url).toMatch(/^https:\/\//);
      expect(linkless).not.toContain(node.name);
    }
    expect(marked).toHaveLength(projects.filter((p) => p.link).length);
  });

  it('attributes every project node back to the one Person', () => {
    for (const node of buildProjects()) {
      expect(node.author).toEqual({ '@id': IDS.person });
    }
  });

  it('keeps the CV graph identity-only, without restating the project list', () => {
    const cv = buildGraph({ page: 'cv', dateModified: '2026-08-23' })['@graph'];
    expect(cv.some((n) => n['@type'] === 'SoftwareSourceCode')).toBe(false);
    expect(cv.find((n) => n['@type'] === 'ProfilePage')['@id']).toBe(IDS.cvPage);
  });
});
