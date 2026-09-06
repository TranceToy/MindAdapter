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

  document.addEventListener('visibilitychange', watchVisibility);
  context.addEventListener('statechange', watchState);
  navigator.mediaDevices.addEventListener('devicechange', interrupt);

  return () => {
    document.removeEventListener('visibilitychange', watchVisibility);
    context.removeEventListener('statechange', watchState);
    navigator.mediaDevices.removeEventListener('devicechange', interrupt);
  };
}
