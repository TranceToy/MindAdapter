import { describe, expect, it } from 'vitest';
import { ARMS, BAND_REACH, RADIUS, VIEW_HALF, armPaths } from './spiral-arms';

function lastPoint(path: string): { x: number; y: number } {
  const steps = path.split(' L ');
  const last = steps[steps.length - 1] ?? '';
  const [x = 0, y = 0] = last.split(' ').map(Number);
  return { x, y };
}

function reach(path: string): number {
  const point = lastPoint(path);
  return Math.hypot(point.x, point.y);
}

describe('armPaths', () => {
  it('draws one arm per arm', () => {
    expect(armPaths()).toHaveLength(ARMS);
  });

  it('starts every arm at the centre', () => {
    for (const path of armPaths()) expect(path.startsWith('M 0 0 L ')).toBe(true);
  });

  it('runs every arm out to the same radius', () => {
    for (const path of armPaths()) expect(reach(path)).toBeCloseTo(RADIUS, 1);
  });

  // Past the corner of the square the arms are centred in, which is what keeps
  // a turning spiral covering a box of any aspect ratio. It is the band that
  // has to reach it, not the arm end, since the ray between two arm ends is
  // covered a spacing further in.
  it('bands past the corner of the viewBox, not merely to it', () => {
    expect(BAND_REACH).toBeGreaterThan(VIEW_HALF * Math.SQRT2);
    expect(RADIUS).toBeGreaterThan(BAND_REACH);
  });

  it('spaces the arms evenly around the turn', () => {
    const paths = armPaths();
    const angles = paths.map((path) => Math.atan2(lastPoint(path).y, lastPoint(path).x));
    const spread = new Set(angles.map((angle) => angle.toFixed(3)));
    expect(spread.size).toBe(ARMS);
  });
});
