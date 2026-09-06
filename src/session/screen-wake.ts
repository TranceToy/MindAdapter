export type ScreenWake = {
  renew: () => void;
  release: () => void;
};

export async function holdScreenAwake(): Promise<ScreenWake> {
  let sentinel = await requestWake();
  let held = true;

  // A lock dies the moment the document goes hidden, so it is re-held rather
  // than held, for the whole session and the whole hold.
  async function reacquire(): Promise<void> {
    if (!held || document.visibilityState !== 'visible') return;
    if (sentinel && !sentinel.released) return;
    const fresh = await requestWake();
    if (held) sentinel = fresh;
    else void fresh?.release();
  }

  function renew(): void {
    void reacquire();
  }

  function release(): void {
    if (!held) return;
    held = false;
    document.removeEventListener('visibilitychange', renew);
    void sentinel?.release();
    sentinel = null;
  }

  document.addEventListener('visibilitychange', renew);
  return { renew, release };
}

async function requestWake(): Promise<WakeLockSentinel | null> {
  try {
    return await navigator.wakeLock.request('screen');
  } catch {
    // A refused lock costs a dimmed screen, which is not worth stopping for.
    return null;
  }
}
