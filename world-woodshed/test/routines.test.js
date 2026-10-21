import './env.js';
import { describe, it, expect, beforeEach } from 'vitest';
import E from '../src/engine.js';
import D from '../src/data.js';
import { BLOCKS, TEMPLATES, paramsFor, fitTo, placeBreaks, setTotal, totalOf, fromTemplate, newBlock, awayBlocks, needsGuitar, fmtMin, fmtClock } from '../src/routines.js';

/* Routines (src/routines.js): fitting blocks to a total length, automatic breaks, and swapping
   guitar blocks for no-guitar drills. */

beforeEach(() => E.resetAll());
const blk = (type, minutes, extra) => Object.assign(newBlock(type), { minutes }, extra || {});
const autoBreaks = r => r.blocks.filter(b => b.type === 'break' && b.auto);

describe('fitTo', () => {
  it('scales the flexible blocks in proportion and hits the total exactly', () => {
    const blocks = [blk('scalewarm', 10), blk('technique', 20), blk('intervals', 10)];
    fitTo(blocks, 20);
    expect(blocks.map(b => b.minutes)).toEqual([5, 10, 5]);
    fitTo(blocks, 33);
    expect(totalOf(blocks)).toBe(33);
  });
  it('leaves breaks at their length', () => {
    const blocks = [blk('scalewarm', 10), blk('break', 5), blk('technique', 10)];
    fitTo(blocks, 45);
    expect(blocks[1].minutes).toBe(5);
    expect(totalOf(blocks)).toBe(45);
  });
  it('gives every block at least a minute, even when the total is too short for all of them', () => {
    const blocks = [blk('scalewarm', 10), blk('technique', 10), blk('intervals', 10), blk('chords', 10)];
    fitTo(blocks, 2);
    blocks.forEach(b => expect(b.minutes).toBeGreaterThanOrEqual(1));
  });
});

describe('placeBreaks', () => {
  it('adds no break under 75 minutes of practice', () => {
    const blocks = [blk('scalewarm', 30), blk('technique', 30)];
    expect(placeBreaks(blocks, true)).toHaveLength(2);
  });
  it('puts a break before a block that would run a stretch well past 50 minutes', () => {
    const out = placeBreaks([blk('scalewarm', 20), blk('technique', 20), blk('intervals', 30), blk('repertoire', 20)], true);
    expect(out.map(b => b.type)).toEqual(['scalewarm', 'technique', 'break', 'intervals', 'repertoire']);
    expect(out[2].auto).toBe(true);
  });
  it('removes its own breaks when turned off, keeping breaks you placed', () => {
    const mine = blk('break', 5);
    const out = placeBreaks([blk('scalewarm', 40), mine, blk('technique', 40), blk('break', 5, { auto: true })], false);
    expect(out).toContain(mine);
    expect(out.filter(b => b.auto)).toHaveLength(0);
  });
});

describe('setTotal', () => {
  it('makes a routine last the total asked for, breaks included', () => {
    [20, 45, 60, 90, 120, 180, 240].forEach(total => {
      const r = { breaks: true, blocks: [blk('scalewarm', 8), blk('technique', 10), blk('rhythms', 10), blk('repertoire', 15)] };
      setTotal(r, total);
      expect(totalOf(r.blocks), total + ' min').toBe(total);
    });
  });
  it('keeps the balance between blocks when resized again and again', () => {
    const r = { breaks: false, blocks: [blk('scalewarm', 10), blk('technique', 30)] };
    [17, 90, 23, 61, 40].forEach(t => setTotal(r, t));
    expect(r.blocks.map(b => b.minutes)).toEqual([10, 30]);
  });
  it('clamps the total between 5 minutes and 10 hours', () => {
    const r = { breaks: false, blocks: [blk('scalewarm', 10), blk('technique', 10)] };
    expect(totalOf(setTotal(r, 1).blocks)).toBe(5);
    expect(totalOf(setTotal(r, 9999).blocks)).toBe(600);
  });
  it('builds every template at its own length', () => {
    TEMPLATES.forEach(t => {
      const r = fromTemplate(t);
      expect(totalOf(r.blocks), t.id).toBe(t.minutes);
      expect(r.breaks, t.id).toBe(t.minutes >= 90);
      r.blocks.forEach(b => expect(BLOCKS[b.type], t.id + ' ' + b.type).toBeTruthy());
    });
  });
  it('places breaks again after a resize instead of piling them up', () => {
    const r = fromTemplate(TEMPLATES.find(t => t.id === 'marathon'));
    const n = autoBreaks(r).length;
    expect(n).toBeGreaterThan(0);
    setTotal(r, 180); setTotal(r, 180);
    expect(autoBreaks(r)).toHaveLength(n);
    setTotal(r, 60);
    expect(autoBreaks(r)).toHaveLength(0);
  });
});

describe('awayBlocks', () => {
  it('swaps blocks that need the guitar for a drill of the same length, and keeps the rest', () => {
    const blocks = [blk('scalewarm', 8, { settings: { scale: 'dorian', tonic: 2 } }), blk('technique', 10), blk('intervals', 6), blk('free', 5)];
    const out = awayBlocks(blocks);
    expect(out.map(b => b.type)).toEqual(['away', 'away', 'intervals', 'away']);
    expect(out.map(b => b.minutes)).toEqual([8, 10, 6, 5]);
    expect(out[0].settings).toEqual({ drill: 'visualise', scale: 'dorian', tonic: 2 });
    expect(out[1].settings.drill).toBe('fingers');
    expect(out[0].reason).toBe('Instead of scale warm-up');
  });
  it('does not change the original routine', () => {
    const blocks = [blk('intervals', 6)];
    const out = awayBlocks(blocks);
    out[0].minutes = 99;
    expect(blocks[0].minutes).toBe(6);
    expect(needsGuitar(blocks[0])).toBe(false);
    expect(needsGuitar(blk('technique', 5))).toBe(true);
  });
});

describe('formatting', () => {
  it('writes minutes and clock times', () => {
    expect([5, 60, 75, 120].map(fmtMin)).toEqual(['5 min', '1 h', '1 h 15 min', '2 h']);
    expect([0, 65, 3725, -3].map(fmtClock)).toEqual(['0:00', '1:05', '1:02:05', '0:00']);
  });
});

describe('paramsFor', () => {
  it('plays the style drill a block names', () => {
    const id = D.DRILLS[0].id;
    expect(paramsFor(blk('drill', 10, { settings: { drill: id } })).drill).toBe(id);
  });
  // The routine editor once offered the no-guitar drills for style-drill blocks too, so saved
  // routines can name one there; that means "smart choice", not a drill that doesn't exist.
  it('treats a no-guitar drill saved on a style-drill block as the smart choice', () => {
    const p = paramsFor(blk('drill', 10, { settings: { drill: 'konnakol' } }));
    expect(p.drill).not.toBe('konnakol');
    expect(D.DRILLS.some(d => d.id === p.drill)).toBe(true);
  });
});
