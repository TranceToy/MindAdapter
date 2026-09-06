import type { Segment } from '../script/resolve-script';
import type { Elapsed } from './session-clock';
import type { SpiralField } from './spiral-field';
import { spiralAt, spiralTurns } from './spiral-schedule';

export type SpiralLayer = {
  stop: () => void;
};

// Read off the clock every frame rather than counted, so a suspended context
// freezes the turn where it froze the words and there is nothing to re-sync.
export function runSpiralLayer(
  field: SpiralField,
  segments: Segment[],
  elapsed: Elapsed,
): SpiralLayer {
  const turns = spiralTurns(segments);
  let frame = 0;

  function tick(): void {
    frame = requestAnimationFrame(tick);
    const phase = spiralAt(turns, elapsed());
    if (phase) field.turn(phase);
    else field.clear();
  }

  // Where a session ends the spiral stands still: the hold is a frame going
  // quiet, and a layer still turning over it would be the one thing in it that
  // moves.
  function stop(): void {
    cancelAnimationFrame(frame);
  }

  frame = requestAnimationFrame(tick);
  return { stop };
}
