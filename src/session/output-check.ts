import { MONO_OUTPUT_WARNING } from './session-copy';

const STEREO = 2;

// Read wherever the audio path is entered. A mono output silently destroys the
// premise — the ears sum and the interference disappears — but the words, the
// imagery and the voice all still work, so it warns and proceeds rather than
// withholding three working layers to protect one.
export function warnIfMono(destination: AudioDestinationNode): void {
  if (destination.maxChannelCount >= STEREO) return;
  console.warn(MONO_OUTPUT_WARNING);
}
