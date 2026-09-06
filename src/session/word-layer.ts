import type { WordTimes } from '../script/word-times';
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
  times: WordTimes,
  elapsed: Elapsed,
  ended: LastWord,
): WordLayer {
  let frame = 0;
  let shown = -1;

  function tick(): void {
    frame = requestAnimationFrame(tick);
    const cue = cueAt(times, elapsed());
    follow(cue);
  }

  function follow(cue: WordCue): void {
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
