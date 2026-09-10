import { describe, expect, it } from 'vitest';
import {
  FULL_CALIBRATION,
  bedLevel,
  restoreCalibration,
  snapLevel,
  voiceLevel,
} from './calibration';

const SILENT = { voice: 0, bed: 0, snap: 0 };

describe('the calibrated levels', () => {
  it('silences a track at the zero position', () => {
    expect(voiceLevel(SILENT)).toBe(0);
    expect(bedLevel(SILENT)).toBe(0);
    expect(snapLevel(SILENT)).toBe(0);
  });

  it('leaves the sum of what sounds continuously room under full scale', () => {
    const held = bedLevel(FULL_CALIBRATION) + voiceLevel(FULL_CALIBRATION);
    expect(held).toBeLessThan(1);
  });

  it('carries the snap over the voice it lands on', () => {
    expect(snapLevel(FULL_CALIBRATION)).toBeGreaterThan(voiceLevel(FULL_CALIBRATION));
  });

  it('spends more of the track on the quiet end than gain alone would', () => {
    const half = { voice: 0.5, bed: 0.5, snap: 0.5 };
    expect(voiceLevel(half)).toBeLessThan(voiceLevel(FULL_CALIBRATION) / 2);
    expect(bedLevel(half)).toBeLessThan(bedLevel(FULL_CALIBRATION) / 2);
    expect(snapLevel(half)).toBeLessThan(snapLevel(FULL_CALIBRATION) / 2);
  });
});

describe('a calibration read back out of the index', () => {
  it('keeps the levels it was written with', () => {
    const stored = { voice: 0.4, bed: 0.7, snap: 0.2 };
    expect(restoreCalibration(stored)).toEqual(stored);
  });

  it('reads a track that was not there as the top of its own', () => {
    const stored = { voice: 0.4, bed: 0.7 };
    expect(restoreCalibration(stored)).toEqual({ voice: 0.4, bed: 0.7, snap: 1 });
  });

  it('holds a level written outside the track inside it', () => {
    const stored = { voice: -2, bed: 4, snap: Number.NaN };
    expect(restoreCalibration(stored)).toEqual({ voice: 0, bed: 1, snap: 1 });
  });
});
