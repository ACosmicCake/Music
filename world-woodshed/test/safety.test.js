import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/* Text that came from the player or from another device (journal notes, song titles and links, routine
   names, anchor songs, anything in an imported backup or sync file) must never be parsed as HTML.
   The app builds its DOM with h() and textContent; innerHTML is only used to clear an element or to
   insert one of the app's own SVG icons. These checks keep it that way. */

const SRC = new URL('../src/', import.meta.url).pathname;
const files = dir => readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.js') ? [p] : []; });
const code = files(SRC).map(p => ({ p: p.slice(SRC.length), lines: readFileSync(p, 'utf8').split('\n') }));
// the bundled icon constants that may be inserted as markup
const ICON_SOURCES = /^(ICONS\[[a-z]+\]|ICON|LOCK)$/;

describe('no player text is ever parsed as HTML', () => {
  it('innerHTML is only cleared or set to a bundled icon', () => {
    const bad = [];
    code.forEach(({ p, lines }) => lines.forEach((l, i) => {
      for (const m of l.matchAll(/\.innerHTML\s*\+?=\s*([^;]+);/g)) {
        const rhs = m[1].trim();
        if (rhs === "''" || ICON_SOURCES.test(rhs)) continue;
        bad.push(p + ':' + (i + 1) + ' ' + l.trim());
      }
    }));
    expect(bad).toEqual([]);
  });
  it('no other HTML parsing sinks are used', () => {
    const bad = [];
    code.forEach(({ p, lines }) => lines.forEach((l, i) => {
      if (/insertAdjacentHTML|outerHTML\s*=|document\.write|createContextualFragment|DOMParser|srcdoc/.test(l)) bad.push(p + ':' + (i + 1));
    }));
    expect(bad).toEqual([]);
  });
});
