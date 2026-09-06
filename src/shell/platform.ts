// Every probe the app makes about the browser it landed in. Each one names a
// fallback rather than a verdict: what is missing costs a feature, and only the
// two the gate reads cost the app itself.
export function hasAudio(): boolean {
  return typeof window.AudioContext === 'function'
    && typeof window.OfflineAudioContext === 'function';
}

export function hasDirectoryPicker(): boolean {
  return typeof window.showDirectoryPicker === 'function';
}

export function hasDirectoryInput(): boolean {
  return 'webkitdirectory' in HTMLInputElement.prototype;
}

export function hasFullscreen(): boolean {
  return document.fullscreenEnabled;
}

export function isInstalled(): boolean {
  return matchMedia('(display-mode: standalone)').matches;
}
