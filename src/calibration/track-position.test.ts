import { describe, expect, it } from 'vitest';
import { positionWithin } from './track-position';

const RAIL = { left: 100, width: 400 };

describe('positionWithin', () => {
  it('is where along the rail the pointer sits', () => {
    expect(positionWithin(200, RAIL)).toBeCloseTo(0.25);
  });

  it('holds at the ends rather than folding back', () => {
    expect(positionWithin(20, RAIL)).toBe(0);
    expect(positionWithin(900, RAIL)).toBe(1);
  });

  it('is zero on a rail with no width to measure against', () => {
    expect(positionWithin(200, { left: 100, width: 0 })).toBe(0);
  });
});
