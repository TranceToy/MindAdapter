import { MONO_OUTPUT_WARNING } from './session-copy';

const STEREO = 2;

// Read wherever the audio path is entered — at session start and again on every
// resume, whatever caused the pause. The value is fixed against the device the
// context was created against and the pause suspends that context rather than
// rebuilding it, so a resume onto a mono device can read stale. It is unreliable
// only in that direction.
export function isMono(destination: AudioDestinationNode): boolean {
  return destination.maxChannelCount < STEREO;
}

// A mono output silently destroys the premise — the ears sum and the
// interference disappears — but the words, the imagery and the voice all still
// work, so it warns and proceeds rather than withholding three working layers to
// protect one.
export function warnIfMono(destination: AudioDestinationNode): void {
  if (!isMono(destination)) return;
  console.warn(MONO_OUTPUT_WARNING);
}
