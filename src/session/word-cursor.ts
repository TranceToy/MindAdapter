import type { Elapsed } from './session-clock';
import { wordAt } from './word-clock';

export type WordCursor = {
  now: () => number;
  reach: (word: number) => Promise<boolean>;
  stop: () => void;
};

type Waiting = {
  word: number;
  settle: (reached: boolean) => void;
};

// Read off the audio clock rather than counted, so a suspended context freezes
// the imagery on the word it froze the words on and there is nothing to
// re-sync. A stopped cursor settles false, which is how a layer awaiting a word
// that will never arrive lets go.
export function followWords(elapsed: Elapsed, words: number): WordCursor {
  let frame = 0;
  let waiting: Waiting | null = null;

  function now(): number {
    return wordAt(elapsed(), words);
  }

  function tick(): void {
    frame = requestAnimationFrame(tick);
    if (!waiting) return;
    if (now() < waiting.word) return;
    settle(true);
  }

  function settle(reached: boolean): void {
    const pending = waiting;
    waiting = null;
    if (pending) pending.settle(reached);
  }

  function reach(word: number): Promise<boolean> {
    if (now() >= word) return Promise.resolve(true);
    return new Promise((resolve) => {
      waiting = { word, settle: resolve };
    });
  }

  function stop(): void {
    cancelAnimationFrame(frame);
    settle(false);
  }

  frame = requestAnimationFrame(tick);
  return { now, reach, stop };
}
