// Regenerates the two crawler-facing project listings from src/data/projects.js:
// the no-JS <ul> in index.html and the sections in public/llms.txt. Both used to
// be maintained by hand, which is why they had drifted to 9 and 14 projects
// against the app's 17.
//
//   npm run static          rewrite both files in place
//   npm run static:check    exit 1 if either is stale (CI / test guard)
//
// Only the text between the marker comments is touched; everything around them
// is hand-written and stays that way.

/* global process */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { projects } from '../src/data/projects.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const START = 'projects:start';
const END = 'projects:end';

// llms.txt groups by what a reader is looking for, not by our category slugs.
const SECTIONS = [
  ['work', 'Professional work'],
  ['tool', 'Tools, agents & automation'],
  ['app', 'Applications'],
  ['web', 'Client websites'],
  ['research', 'Research & systems'],
];

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// One sentence reads as a summary; a bare fragment like "AI study companion"
// does not. Take sentences until there is enough to be informative, then stop.
const MIN_SUMMARY = 60;
const MAX_SUMMARY = 190;

export function summarise(description) {
  const sentences = description.split(/(?<=\.)\s+/);
  let out = '';
  for (const sentence of sentences) {
    if (out && (out.length >= MIN_SUMMARY || out.length + sentence.length > MAX_SUMMARY)) break;
    out = out ? `${out} ${sentence}` : sentence;
  }
  return out.replace(/\.$/, '');
}

// The crawler snapshot lists every project. Linkless entries render as plain
// text with their reason — a dead <a> is worse for a reader than no <a>.
export function renderIndexList(list) {
  const items = list.map((p) => {
    const name = escapeHtml(p.name);
    const desc = escapeHtml(summarise(p.description));
    const label = p.link
      ? `<a href="${p.link.href}">${name}</a>`
      : `<strong>${name}</strong> <em>(${escapeHtml(p.privateNote)})</em>`;
    return `          <li>${label} &mdash; ${desc}</li>`;
  });
  return items.join('\n');
}

export function renderLlmsSections(list) {
  const blocks = [];
  for (const [category, heading] of SECTIONS) {
    const inSection = list.filter((p) => p.category === category);
    if (inSection.length === 0) continue;
    const lines = inSection.map((p) => {
      const head = p.link
        ? `- [${p.name}](${p.link.href})`
        : `- ${p.name} (${p.privateNote})`;
      return `${head}: ${p.description}`;
    });
    blocks.push(`## ${heading}\n\n${lines.join('\n')}`);
  }
  return blocks.join('\n\n');
}

// Replaces the body between the two markers, preserving the markers themselves
// and their surrounding indentation.
export function applyBlock(source, body) {
  const startIdx = source.indexOf(START);
  const endIdx = source.indexOf(END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`missing ${START}/${END} markers`);
  }
  const afterStart = source.indexOf('\n', startIdx) + 1;
  const beforeEnd = source.lastIndexOf('\n', source.lastIndexOf('<!--', endIdx));
  return `${source.slice(0, afterStart)}${body}${source.slice(beforeEnd)}`;
}

const TARGETS = [
  { file: join(ROOT, 'index.html'), render: renderIndexList },
  { file: join(ROOT, 'public', 'llms.txt'), render: renderLlmsSections },
];

export function generate({ check = false } = {}) {
  const stale = [];
  for (const { file, render } of TARGETS) {
    const current = readFileSync(file, 'utf8');
    const next = applyBlock(current, render(projects));
    if (current === next) continue;
    if (check) {
      stale.push(file.replace(`${ROOT}/`, ''));
    } else {
      writeFileSync(file, next);
      console.log(`updated ${file.replace(`${ROOT}/`, '')}`);
    }
  }
  return stale;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const stale = generate({ check });
  if (stale.length > 0) {
    console.error(
      `stale, run \`npm run static\`: ${stale.join(', ')}`,
    );
    process.exit(1);
  }
  if (check) console.log('static project listings are in sync');
}
