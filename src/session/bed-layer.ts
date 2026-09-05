import { leftFrequency, rightFrequency } from './bed-schedule';
import type { BedGlide, Ear } from './bed-schedule';

// Long enough that entering a segment is not an event that pulls attention off
// the words, and over well inside the segment that asked for it.
export const BED_GLIDE_SECONDS = 3;

const LEFT_INPUT = 0;
const RIGHT_INPUT = 1;

export type BedLayer = {
  stop: (at: number) => void;
};

// Two oscillators hard-panned by the merger, never a panner, and present for the
// whole session: a session is always four layers.
export function runBed(
  context: AudioContext,
  merger: ChannelMergerNode,
  glides: BedGlide[],
  from: number,
): BedLayer {
  const left = createTone(context, merger, LEFT_INPUT);
  const right = createTone(context, merger, RIGHT_INPUT);
  schedule(left.frequency, glides, leftFrequency, from);
  schedule(right.frequency, glides, rightFrequency, from);
  left.start(from);
  right.start(from);

  function stop(at: number): void {
    left.stop(at);
    right.stop(at);
  }

  return { stop };
}

function createTone(
  context: AudioContext,
  merger: ChannelMergerNode,
  input: number,
): OscillatorNode {
  const tone = context.createOscillator();
  tone.connect(merger, 0, input);
  return tone;
}

// Scheduled on the frequency params in absolute context time and never on a
// gain, so a suspended context freezes the bed and the word clock together and
// there is nothing to re-sync. A frequency change is phase-continuous, so the
// glide is for perception rather than against a click.
function schedule(frequency: AudioParam, glides: BedGlide[], ear: Ear, from: number): void {
  const [opening, ...rest] = glides;
  if (!opening) return;
  let running = ear(opening.bed);
  frequency.setValueAtTime(running, from);
  for (const glide of rest) {
    const target = ear(glide.bed);
    frequency.setValueAtTime(running, from + glide.at);
    frequency.linearRampToValueAtTime(target, from + glide.at + BED_GLIDE_SECONDS);
    running = target;
  }
}
