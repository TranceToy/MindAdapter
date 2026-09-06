import { resumeQuietly } from './context-state';
import { enterFullscreen } from './fullscreen';
import { holdScreenAwake } from './screen-wake';
import type { ScreenWake } from './screen-wake';

export type SessionEntry = {
  context: AudioContext;
  wake: ScreenWake;
  fullscreen: boolean;
};

// The session's one user activation, spent in the order of §8.2. Neither call
// after the first needs the transient activation to survive the await: a wake
// lock requires no activation at all, and resume() is gated on sticky
// activation, which never reverts once the document has had one gesture.
//
// Refused fullscreen costs the exit gesture and not the session — a windowed
// one is watched for Escape instead — so the context is the only thing here
// worth stopping for: without it there are no layers to run.
export async function enterSession(): Promise<SessionEntry | null> {
  const fullscreen = await enterFullscreen();
  const context = openContext();
  if (!context) return null;
  const wake = await holdScreenAwake();
  await resumeQuietly(context);
  return { context, wake, fullscreen };
}

function openContext(): AudioContext | null {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}
