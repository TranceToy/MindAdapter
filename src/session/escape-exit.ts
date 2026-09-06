export type Escaped = () => void;

// The exit gesture for a session that never entered fullscreen: the same key
// that would have left it, doing the same thing, so a windowed session ends the
// way every other one does.
export function whenEscaped(leave: Escaped): () => void {
  function watch(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    leave();
  }

  document.addEventListener('keydown', watch);
  return () => document.removeEventListener('keydown', watch);
}
