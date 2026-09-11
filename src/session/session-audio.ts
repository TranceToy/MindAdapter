import { bedLevel, snapLevel, voiceLevel } from '../calibration/calibration';
import type { Calibration } from '../calibration/calibration';
import type { Rounds } from '../script/session-round';
import { createAudioGraph } from './audio-graph';
import type { AudioGraph } from './audio-graph';
import { runBed } from './bed-layer';
import type { BedLayer } from './bed-layer';
import { bedGlides } from './bed-schedule';
import type { Glides } from './bed-schedule';
import { enterRunning, suspendQuietly } from './context-state';
import { rampGain, riseGain } from './gain-ramp';
import type { SegmentOrder } from './segment-order';

// The image is held against this one, so the ending is ten seconds of a still
// frame going quiet rather than a cut.
export const NATURAL_END_SECONDS = 10;

// 300 ms rather than the declick floor: 30 ms at full bed level is audibly a
// cut, and abrupt silence is itself a startle, which this gesture is often fired
// by someone already feeling.
export const EXIT_SECONDS = 0.3;

// Long enough that the bed arrives rather than lands, and short enough that the
// words it comes in under are still the ones it was meant for — the opening word
// as much as the one a pause was taken from.
export const ENTRY_SECONDS = 5;

export type SessionAudio = {
  voice: GainNode;
  snap: GainNode;
  end: () => void;
  leave: () => void;
  suspend: () => void;
  reEnter: () => Promise<void>;
  halt: () => void;
};

export function startSessionAudio(
  context: AudioContext,
  order: SegmentOrder,
  calibration: Calibration,
  from: number,
  rounds: Rounds,
): SessionAudio {
  const graph = createAudioGraph(context);
  const glides: Glides = (round) => bedGlides(order.playing(round).segments);
  const bed = runBed(context, graph.merger, glides, from, rounds);
  setLevels(graph, calibration, from);
  enter(graph.master.gain, from);
  return stops(context, graph, bed);
}

// The levels the user set by ear, written once at the start and never again,
// the bed's least of all: a bed dipping under every clip would make itself an
// event and train the user to anticipate suggestions — no ducking, ever. The
// snap is written here with them and never by the layer that strikes it: what a
// strike is worth against the bed under it is the user's, and what the file it
// was cut from happened to be recorded at is the sound's own scalar.
function setLevels(graph: AudioGraph, calibration: Calibration, from: number): void {
  graph.bed.gain.setValueAtTime(bedLevel(calibration), from);
  graph.voice.gain.setValueAtTime(voiceLevel(calibration), from);
  graph.snap.gain.setValueAtTime(snapLevel(calibration), from);
}

// masterGain rests at 1 and climbs to it from silence twice: here, under the
// first word, and on the way back in from a pause.
function enter(master: AudioParam, from: number): void {
  riseGain(master, ENTRY_SECONDS, from);
}

function stops(context: AudioContext, graph: AudioGraph, bed: BedLayer): SessionAudio {
  function fade(seconds: number): number {
    const done = rampGain(graph.master.gain, 0, seconds, context.currentTime);
    bed.stop(done);
    return done;
  }

  function end(): void {
    fade(NATURAL_END_SECONDS);
  }

  // The screen does not wait for this: the selection screen is already rendered
  // on the frame the gesture arrived, and the ramp finishes behind it.
  function leave(): void {
    const done = fade(EXIT_SECONDS);
    closeAfter(context, done - context.currentTime);
  }

  // Suspending stops currentTime, which is the whole freeze: the bed's glides,
  // the clips already scheduled and the word clock are all written against it,
  // so none of them can drift from the others while the session is held.
  function suspend(): void {
    void suspendQuietly(context);
  }

  async function reEnter(): Promise<void> {
    await enterRunning(context);
    riseGain(graph.master.gain, ENTRY_SECONDS, context.currentTime);
  }

  // Nothing to fade: the context has been silent since the pause took it, so the
  // teardown is the whole of this ending.
  function halt(): void {
    bed.stop(context.currentTime);
    void context.close();
  }

  return { voice: graph.voice, snap: graph.snap, end, leave, suspend, reEnter, halt };
}

const SECOND = 1000;

// Teardown only once the ramp has completed, or the close is the click the ramp
// was for.
function closeAfter(context: AudioContext, seconds: number): void {
  window.setTimeout(() => void context.close(), seconds * SECOND);
}
