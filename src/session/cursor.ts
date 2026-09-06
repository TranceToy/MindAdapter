export type Position = () => number;

export type Cursor = {
  now: () => number;
  reach: (position: number) => Promise<boolean>;
  stop: () => void;
};

type Waiting = {
  position: number;
  settle: (reached: boolean) => void;
};

// Read off the audio clock rather than counted, so a suspended context freezes
// every layer where it froze the words and there is nothing to re-sync. A
// stopped cursor settles false, which is how a layer waiting on a position that
// will never arrive lets go.
export function followPosition(position: Position): Cursor {
  let frame = 0;
  let waiting: Waiting | null = null;

  function now(): number {
    return position();
  }

  function tick(): void {
    frame = requestAnimationFrame(tick);
    if (!waiting) return;
    if (now() < waiting.position) return;
    settle(true);
  }

  function settle(reached: boolean): void {
    const pending = waiting;
    waiting = null;
    if (pending) pending.settle(reached);
  }

  function reach(wanted: number): Promise<boolean> {
    if (now() >= wanted) return Promise.resolve(true);
    return new Promise((resolve) => {
      waiting = { position: wanted, settle: resolve };
    });
  }

  function stop(): void {
    cancelAnimationFrame(frame);
    settle(false);
  }

  frame = requestAnimationFrame(tick);
  return { now, reach, stop };
}
