import type { Rounds } from '../script/session-round';
import { leftFrequency, rightFrequency } from './bed-schedule';
import type { Ear, Glides } from './bed-schedule';
import { watchRounds } from './round-watch';
import type { ArmRound } from './round-watch';
import { anchorClock } from './session-clock';

// Long enough that entering a segment is not an event that pulls attention off
// the words, and over well inside the segment that asked for it.
export const BED_GLIDE_SECONDS = 3;

const LEFT_INPUT = 0;
const RIGHT_INPUT = 1;

export type BedLayer = {
  stop: (at: number) => void;
};

// Two oscillators hard-panned by the merger, never a panner, and present for the
// whole session: the bed is one of the four layers no session is without.
export function runBed(
  context: AudioContext,
  merger: ChannelMergerNode,
  glides: Glides,
  from: number,
  rounds: Rounds,
): BedLayer {
  const left = createTone(context, merger, LEFT_INPUT);
  const right = createTone(context, merger, RIGHT_INPUT);
  const ears = [
    armEar(left.frequency, glides, leftFrequency, from, rounds),
    armEar(right.frequency, glides, rightFrequency, from, rounds),
  ];

  function arm(round: number): void {
    for (const ear of ears) ear(round);
  }

  const elapsed = anchorClock(context, from);
  const watch = watchRounds(elapsed, rounds, arm);
  left.start(from);
  right.start(from);

  function stop(at: number): void {
    watch.stop();
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
// glide is for perception rather than against a click. The running pair is
// carried from round to round as it is from glide to glide, so a script that
// comes round glides from the pair it ended on into the pair it opens on, and a
// script whose bed never changes writes nothing after its first round — which is
// true of a shuffled script too, whatever order its segments were drawn in.
function armEar(
  frequency: AudioParam,
  glides: Glides,
  ear: Ear,
  from: number,
  rounds: Rounds,
): ArmRound {
  let running: number | null = null;
  return (round: number) => {
    const opened = from + round * rounds.seconds;
    for (const glide of glides(round)) {
      const target = ear(glide.bed);
      const at = opened + glide.at;
      if (running === null) frequency.setValueAtTime(target, at);
      else if (target !== running) glideTo(frequency, running, target, at);
      running = target;
    }
  };
}

function glideTo(frequency: AudioParam, running: number, target: number, at: number): void {
  frequency.setValueAtTime(running, at);
  frequency.linearRampToValueAtTime(target, at + BED_GLIDE_SECONDS);
}
