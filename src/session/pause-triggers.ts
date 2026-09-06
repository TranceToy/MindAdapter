export type Interrupt = () => void;

// Three signals, one mechanism, and the device one unfiltered: without a
// getUserMedia grant device labels are blank, so no filter is reliable, and a
// false pause costs one click where a false continue costs the room. Bound only
// while a session runs, because no other screen has anything to protect.
export function whenInterrupted(context: AudioContext, interrupt: Interrupt): () => void {
  function watchVisibility(): void {
    if (document.visibilityState !== 'hidden') return;
    interrupt();
  }

  function watchState(): void {
    if (context.state !== 'interrupted') return;
    interrupt();
  }

  // A browser that exposes no devices reports no device changes, which costs
  // the third signal and leaves the other two watching.
  const devices = navigator.mediaDevices ?? null;
  document.addEventListener('visibilitychange', watchVisibility);
  context.addEventListener('statechange', watchState);
  devices?.addEventListener('devicechange', interrupt);

  return () => {
    document.removeEventListener('visibilitychange', watchVisibility);
    context.removeEventListener('statechange', watchState);
    devices?.removeEventListener('devicechange', interrupt);
  };
}
