import { actionHero, surface } from '../shell/antechamber';
import type { Calibration } from './calibration';
import { BED_LINE, CALIBRATION_LINE, VOICE_LINE } from './calibration-copy';
import { renderTrack } from './track';
import type { MoveLevel } from './track';

export type LeaveCalibration = () => void;

export type CalibrationMoves = {
  voice: MoveLevel;
  bed: MoveLevel;
  leave: LeaveCalibration;
};

// The heading is the one control that means done here, and where it goes
// follows from how the screen was reached. There is no play control: playing is
// what the surface is for, and arrival is always by a click, so the sound has
// its activation already.
export function renderCalibration(opening: Calibration, moves: CalibrationMoves): HTMLElement {
  const heading = actionHero(CALIBRATION_LINE, moves.leave);
  const voice = renderTrack(VOICE_LINE, opening.voice, moves.voice);
  const bed = renderTrack(BED_LINE, opening.bed, moves.bed);
  return surface([heading, voice, bed]);
}
