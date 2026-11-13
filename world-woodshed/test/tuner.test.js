import { describe, it, expect } from 'vitest';
import { a4Of, freqToMidi, at440, nearestNote, pickString, advice, centsText, needleAngle, Steady } from '../src/tuner.js';

const STD = [40, 45, 50, 55, 59, 64];
const DROP_D = [38, 45, 50, 55, 59, 64];

describe('tuner', () => {
  it('reads pitch at any reference A', () => {
    expect(freqToMidi(440)).toBeCloseTo(69, 6);
    expect(freqToMidi(442, 442)).toBeCloseTo(69, 6);
    expect(freqToMidi(82.41)).toBeCloseTo(40, 2);
    // at A = 442, a 440 Hz A is about 8 cents flat
    expect(nearestNote(freqToMidi(440, 442)).cents).toBe(-8);
    expect(at440(69, 442)).toBeCloseTo(freqToMidi(442), 6);
  });
  it('keeps A in range', () => {
    expect(a4Of(432)).toBe(432);
    expect(a4Of(500)).toBe(440);
    expect(a4Of('x')).toBe(440);
    expect(a4Of(undefined)).toBe(440);
  });
  it('finds the nearest note and cents', () => {
    expect(nearestNote(40.12)).toEqual({ midi: 40, cents: 12 });
    expect(nearestNote(44.7)).toEqual({ midi: 45, cents: -30 });
  });
  it('picks the string being tuned', () => {
    expect(pickString(45.1, STD)).toMatchObject({ si: 1, cents: 10, folded: false });
    expect(pickString(63.8, STD)).toMatchObject({ si: 5, cents: -20 });
    // a picked low E heard on its second harmonic is still the low E
    expect(pickString(52.05, STD, 0)).toMatchObject({ si: 0, cents: 5, folded: true });
    // in Auto a B string a whole step down is the B string, not an A string in tune
    expect(pickString(57, STD)).toMatchObject({ si: 3, cents: 200 });
    // a D string a whole step low reads as the D string, flat
    expect(pickString(48, STD)).toMatchObject({ si: 2, cents: -200, folded: false });
    // drop D: the low string tuned to D
    expect(pickString(38.02, DROP_D)).toMatchObject({ si: 0, cents: 2 });
    // a picked string is measured against that string only
    expect(pickString(42, STD, 0)).toMatchObject({ si: 0, cents: 200, folded: false });
    expect(pickString(64, STD, 1).si).toBe(1);
  });
  it('says which way to turn', () => {
    expect(advice(3)).toBe('In tune');
    expect(advice(-4)).toBe('In tune');
    expect(advice(12)).toBe('Sharp by 12 cents, tune down');
    expect(advice(-30)).toBe('Flat by 30 cents, tune up');
    expect(advice(-200)).toBe('Flat by about 2 semitones, tune up');
    expect(centsText(-7)).toBe('−7');
    expect(centsText(0)).toBe('0');
    expect(needleAngle(50)).toBe(45);
    expect(needleAngle(-300)).toBe(-45);
  });
  it('steadies the readings', () => {
    const st = Steady();
    expect(st.push(40.1)).toBeCloseTo(40.1);
    st.push(40.1); st.push(40.1);
    expect(st.push(52)).toBeNull(); // one wild reading is dropped
    st.push(40.3); st.push(40.3);
    const v = st.push(40.3);
    expect(v).toBeGreaterThan(40.1); expect(v).toBeLessThan(40.3);
  });
});
