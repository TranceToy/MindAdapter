import type { ClipPool } from '../library/scan-library';
import type { SurfaceHost } from '../shell/surface-host';
import type { Calibration } from './calibration';
import { startPreview } from './calibration-audio';
import { renderCalibration } from './calibration-screen';
import type { CalibrationMoves } from './calibration-screen';
import { saveCalibration } from './calibration-store';

export type CalibrationSet = (calibration: Calibration) => void;

// Sound starts with the screen and stops on leaving it, and the levels are
// written to the index on the way out: what is heard here is what a session
// runs at, and nothing during one can reach them.
export function showCalibration(
  host: SurfaceHost,
  pools: ClipPool[],
  opening: Calibration,
  done: CalibrationSet,
): void {
  const preview = startPreview(pools, opening);
  let held = opening;

  function moveVoice(position: number): void {
    const moved = { ...held, voice: position };
    held = moved;
    preview.set(moved);
  }

  function moveBed(position: number): void {
    const moved = { ...held, bed: position };
    held = moved;
    preview.set(moved);
  }

  function moveSnap(position: number): void {
    const moved = { ...held, snap: position };
    held = moved;
    preview.set(moved);
  }

  function leave(): void {
    preview.stop();
    void saveCalibration(held);
    done(held);
  }

  const moves: CalibrationMoves = { voice: moveVoice, bed: moveBed, snap: moveSnap, leave };
  const screen = renderCalibration(opening, moves);
  host.show(screen);
}
