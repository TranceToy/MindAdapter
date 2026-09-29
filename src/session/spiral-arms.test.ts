import { describe, expect, it } from 'vitest';
import {
  ARMS,
  BAND_REACH,
  CORE,
  GROWTH,
  RADIUS,
  SHADE,
  VIEW_HALF,
  armBands,
} from './spiral-arms';

type Point = { x: number; y: number };

function points(path: string): Point[] {
  const body = path.replace(/^M /, '').replace(/ Z$/, '');
  return body.split(' L ').map((step) => {
    const [x = 0, y = 0] = step.split(' ').map(Number);
    return { x, y };
  });
}

function furthest(path: string): Point {
  const all = points(path);
  return all.reduce((far, point) =>
    Math.hypot(point.x, point.y) > Math.hypot(far.x, far.y) ? point : far,
  );
}

describe('armBands', () => {
  it('draws one band per arm', () => {
    expect(armBands(CORE)).toHaveLength(ARMS);
  });

  it('closes every band into an outline', () => {
    for (const path of armBands(CORE)) {
      expect(path.startsWith('M ')).toBe(true);
      expect(path.endsWith(' Z')).toBe(true);
    }
  });

  it('runs every band out to the same radius, widened by its half-width', () => {
    for (const path of armBands(CORE)) {
      const far = furthest(path);
      expect(Math.hypot(far.x, far.y)).toBeCloseTo(RADIUS * GROWTH ** CORE, 0);
    }
  });

  it('keeps a wider band wider at the same place', () => {
    const [shade = ''] = armBands(SHADE);
    const [core = ''] = armBands(CORE);
    const shadeFar = furthest(shade);
    const coreFar = furthest(core);
    expect(Math.hypot(shadeFar.x, shadeFar.y)).toBeGreaterThan(Math.hypot(coreFar.x, coreFar.y));
  });

  // Past the corner of the square the arms are centred in, which is what keeps
  // a turning spiral covering a box of any aspect ratio. It is the band that
  // has to reach it, not the arm end, since a ray between the arm ends is
  // crossed one growth step further in.
  it('bands past the corner of the viewBox, not merely to it', () => {
    expect(BAND_REACH).toBeGreaterThan(VIEW_HALF * Math.SQRT2);
    expect(RADIUS).toBeGreaterThan(BAND_REACH);
  });

  it('lays the arms dark bands edge over edge, leaving no seam', () => {
    expect(SHADE * 2).toBeGreaterThan(1);
  });

  it('spaces the arms evenly around the turn', () => {
    const ends = armBands(CORE).map(furthest);
    const angles = ends.map((end) => Math.atan2(end.y, end.x));
    const spread = new Set(angles.map((angle) => angle.toFixed(3)));
    expect(spread.size).toBe(ARMS);
  });
});
