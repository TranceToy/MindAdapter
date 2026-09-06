export async function resumeQuietly(context: AudioContext): Promise<void> {
  try {
    await context.resume();
  } catch {
    // A failed resume is recoverable, so it does not refuse the click.
  }
}

export async function suspendQuietly(context: AudioContext): Promise<void> {
  try {
    await context.suspend();
  } catch {
    // A context already interrupted is already silent, which is all the suspend
    // was for.
  }
}

// What is awaited is the state, not the call: resume() rejects outright while an
// interruption is in force, and the state comes back on its own when it lifts.
export async function enterRunning(context: AudioContext): Promise<void> {
  await resumeQuietly(context);
  if (context.state === 'running') return;
  await whenRunning(context);
}

function whenRunning(context: AudioContext): Promise<void> {
  return new Promise<void>((settle) => {
    function watch(): void {
      if (context.state !== 'running') return;
      context.removeEventListener('statechange', watch);
      settle();
    }

    context.addEventListener('statechange', watch);
  });
}
