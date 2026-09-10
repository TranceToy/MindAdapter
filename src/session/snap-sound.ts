import snapFile from '../assets/snap.mp3';

// The sound a mark makes, and the only audio in a session that does not come
// out of the library: what a mark sounds like is the app's, exactly as the
// colour it is shown in is.
export type Snap = {
  buffer: AudioBuffer;
  scalar: number;
};

// The peak the sound is normalised to before the snap track takes it, which is
// the ceiling a clip is capped at by its own scan: what the two of them are
// then heard at is the level the user set for each, over a ceiling of its own.
const SNAP_PEAK = 0.99;

export async function loadSnap(context: AudioContext): Promise<Snap | null> {
  const buffer = await decodeSnap(context);
  if (!buffer) return null;
  const scalar = snapScalar(buffer);
  if (scalar === 0) return null;
  return { buffer, scalar };
}

// A session without the sound rather than a session refused: the mark still
// shows in its colour, which is what the mark was before it sounded.
async function decodeSnap(context: AudioContext): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(snapFile);
    const bytes = await response.arrayBuffer();
    return await context.decodeAudioData(bytes);
  } catch {
    return null;
  }
}

// Measured rather than declared, because a decoded mp3 overshoots the file it
// was encoded from and the file may be replaced by another: the scalar is
// whatever puts this buffer's loudest sample at the peak, exactly as the scan
// backs a clip off to one.
function snapScalar(buffer: AudioBuffer): number {
  const peak = peakOf(buffer);
  if (peak === 0) return 0;
  return SNAP_PEAK / peak;
}

// One strike, at a time on the audio clock or now where a caller has no clock
// to write against. The scalar rides a gain of its own rather than the snap
// track's, because that track carries the level the user set and this carries
// what the file happened to be recorded at.
export function strikeSnap(
  context: AudioContext,
  snap: GainNode,
  sound: Snap,
  at = context.currentTime,
): void {
  const source = context.createBufferSource();
  const level = context.createGain();
  source.buffer = sound.buffer;
  level.gain.value = sound.scalar;
  source.connect(level);
  level.connect(snap);
  source.onended = () => level.disconnect();
  source.start(at);
}

function peakOf(buffer: AudioBuffer): number {
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    for (const sample of buffer.getChannelData(channel)) {
      const magnitude = Math.abs(sample);
      if (magnitude > peak) peak = magnitude;
    }
  }
  return peak;
}
