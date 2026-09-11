import type { Rounds } from '../script/session-round';
import type { SegmentOrder } from './segment-order';
import type { Elapsed } from './session-clock';
import type { SpiralField } from './spiral-field';
import { spiralAt, spiralTurning } from './spiral-schedule';

export type SpiralLayer = {
  stop: () => void;
};

// Read off the clock every frame rather than counted, so a suspended context
// freezes the turn where it froze the words and there is nothing to re-sync.
export function runSpiralLayer(
  field: SpiralField,
  order: SegmentOrder,
  elapsed: Elapsed,
  rounds: Rounds,
): SpiralLayer {
  const turning = spiralTurning(order, rounds);
  let frame = 0;

  function tick(): void {
    frame = requestAnimationFrame(tick);
    const phases = spiralAt(turning, elapsed());
    if (phases.length > 0) field.turn(phases);
    else field.clear();
  }

  // Where a session ends the spirals stand still: the hold is a frame going
  // quiet, and a layer still turning over it would be the one thing in it that
  // moves. A looping session reaches no hold, so nothing stops this but the
  // exit gesture.
  function stop(): void {
    cancelAnimationFrame(frame);
  }

  frame = requestAnimationFrame(tick);
  return { stop };
}
