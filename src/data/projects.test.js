import { describe, it, expect } from 'vitest';
import { projects } from './projects.js';

describe('projects data', () => {
  it('includes the mira-study project', () => {
    const ids = projects.map((p) => p.id);
    expect(ids).toContain('mira-study');
  });

  it('mira-study has a valid GitHub href', () => {
    const p = projects.find((p) => p.id === 'mira-study');
    expect(p).toBeDefined();
    expect(p.href).toBe('https://github.com/IsliBasha/mira-study');
  });

  it('mira-study lists PyQt6 in its stack', () => {
    const p = projects.find((p) => p.id === 'mira-study');
    expect(p.stack).toContain('PyQt6');
  });

  it('all projects have required fields', () => {
    for (const p of projects) {
      expect(p.id, `${p.id} missing id`).toBeTruthy();
      expect(p.name, `${p.id} missing name`).toBeTruthy();
      expect(p.description, `${p.id} missing description`).toBeTruthy();
      expect(Array.isArray(p.stack), `${p.id} stack must be array`).toBe(true);
      expect(p.href, `${p.id} missing href`).toBeTruthy();
      expect(p.iconType, `${p.id} missing iconType`).toBeTruthy();
      expect(p.tag, `${p.id} missing tag`).toBeTruthy();
    }
  });
});
