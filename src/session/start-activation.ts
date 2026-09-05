import { enterFullscreen } from './fullscreen';
import { holdScreenAwake } from './screen-wake';
import type { ScreenWake } from './screen-wake';

export type SessionEntry = {
  context: AudioContext;
  wake: ScreenWake;
};

// The session's one user activation, spent in the order of §8.2. Neither call
// after the first needs the transient activation to survive the await: a wake
// lock requires no activation at all, and resume() is gated on sticky
// activation, which never reverts once the document has had one gesture.
export async function enterSession(): Promise<SessionEntry | null> {
  const fullscreen = await enterFullscreen();
  if (!fullscreen) return null;
  const context = new AudioContext();
  const wake = await holdScreenAwake();
  await resumeQuietly(context);
  return { context, wake };
}

async function resumeQuietly(context: AudioContext): Promise<void> {
  try {
    await context.resume();
  } catch {
    // A failed resume is recoverable, so it does not refuse the click.
  }
}
