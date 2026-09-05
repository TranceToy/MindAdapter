export type LeaveFullscreen = () => void;

export async function enterFullscreen(): Promise<boolean> {
  try {
    await document.documentElement.requestFullscreen();
    return true;
  } catch {
    return false;
  }
}

export function whenFullscreenLeft(leave: LeaveFullscreen): () => void {
  function watch(): void {
    if (document.fullscreenElement) return;
    // Visibility wins: a fullscreen loss on a hidden page is environmental.
    if (document.visibilityState !== 'visible') return;
    leave();
  }

  document.addEventListener('fullscreenchange', watch);
  return () => document.removeEventListener('fullscreenchange', watch);
}
