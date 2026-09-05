import type { Elapsed } from './session-clock';
import { cueAt } from './word-clock';
import type { WordCue } from './word-clock';
import type { WordField } from './word-field';

export type WordLayer = {
  stop: () => void;
};

export type LastWord = () => void;

export function runWordLayer(
  field: WordField,
  words: number,
  elapsed: Elapsed,
  ended: LastWord,
): WordLayer {
  let frame = 0;
  let shown = -1;

  function tick(): void {
    frame = requestAnimationFrame(tick);
    const cue = cueAt(elapsed(), words);
    follow(cue);
  }

  function follow(cue: WordCue): void {
    if (cue.kind === 'lead-in') return;
    if (cue.kind === 'ended') {
      end();
      return;
    }
    if (cue.index === shown) return;
    shown = cue.index;
    field.show(cue.index);
  }

  function end(): void {
    field.retire();
    stop();
    ended();
  }

  function stop(): void {
    cancelAnimationFrame(frame);
  }

  frame = requestAnimationFrame(tick);
  return { stop };
}
