import { describe, expect, it } from 'vitest';
import { FULL_CALIBRATION, bedLevel, voiceLevel } from './calibration';

const SILENT = { voice: 0, bed: 0 };

describe('the calibrated levels', () => {
  it('silences a layer at the zero position', () => {
    expect(voiceLevel(SILENT)).toBe(0);
    expect(bedLevel(SILENT)).toBe(0);
  });

  it('leaves the sum room under full scale at the top of both tracks', () => {
    const summed = bedLevel(FULL_CALIBRATION) + voiceLevel(FULL_CALIBRATION);
    expect(summed).toBeLessThan(1);
  });

  it('spends more of the track on the quiet end than gain alone would', () => {
    const half = { voice: 0.5, bed: 0.5 };
    expect(voiceLevel(half)).toBeLessThan(voiceLevel(FULL_CALIBRATION) / 2);
    expect(bedLevel(half)).toBeLessThan(bedLevel(FULL_CALIBRATION) / 2);
  });
});
