import { afterEach, describe, expect, it, vi } from 'vitest';
import { followPosition } from './cursor';

type Frames = {
  advance: () => void;
  pending: () => number;
};

// A cursor reads its position on the browser's frame, so the frames are driven
// by hand here and what is left scheduled after a stop can be counted.
function drivenFrames(): Frames {
  const scheduled = new Map<number, FrameRequestCallback>();
  let handles = 0;

  function request(callback: FrameRequestCallback): number {
    handles += 1;
    scheduled.set(handles, callback);
    return handles;
  }

  function cancel(handle: number): void {
    scheduled.delete(handle);
  }

  function advance(): void {
    const due = [...scheduled.values()];
    scheduled.clear();
    for (const callback of due) callback(0);
  }

  vi.stubGlobal('requestAnimationFrame', request);
  vi.stubGlobal('cancelAnimationFrame', cancel);
  return { advance, pending: () => scheduled.size };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('followPosition', () => {
  it('settles a waiter true on the frame its position arrives', async () => {
    const frames = drivenFrames();
    let at = 0;
    const cursor = followPosition(() => at);
    const reached = cursor.reach(3);
    frames.advance();
    at = 3;
    frames.advance();
    await expect(reached).resolves.toBe(true);
    cursor.stop();
  });

  it('settles a waiter already past its position without waiting for a frame', async () => {
    drivenFrames();
    const cursor = followPosition(() => 5);
    await expect(cursor.reach(3)).resolves.toBe(true);
    cursor.stop();
  });

  it('settles a waiter false where it is stopped short of its position', async () => {
    const frames = drivenFrames();
    const cursor = followPosition(() => 0);
    const reached = cursor.reach(3);
    frames.advance();
    cursor.stop();
    await expect(reached).resolves.toBe(false);
  });

  it('leaves no frame ticking once it is stopped', () => {
    const frames = drivenFrames();
    const cursor = followPosition(() => 0);
    frames.advance();
    expect(frames.pending()).toBe(1);
    cursor.stop();
    expect(frames.pending()).toBe(0);
  });
});
