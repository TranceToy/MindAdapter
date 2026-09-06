import type { Segment } from '../script/resolve-script';
import { createAudioGraph } from './audio-graph';
import type { AudioGraph } from './audio-graph';
import { runBed } from './bed-layer';
import type { BedLayer } from './bed-layer';
import { bedGlides } from './bed-schedule';
import { rampGain } from './gain-ramp';
import { warnIfMono } from './output-check';
import { LEAD_IN_SECONDS } from './word-clock';

// The image is held against this one, so the ending is ten seconds of a still
// frame going quiet rather than a cut.
export const NATURAL_END_SECONDS = 10;

// 300 ms rather than the declick floor: 30 ms at full bed level is audibly a
// cut, and abrupt silence is itself a startle, which this gesture is often fired
// by someone already feeling.
export const EXIT_SECONDS = 0.3;

// Headroom by construction. An oscillator is a full-scale sine, so an unscaled
// bed leaves the output no room at all and a suggestion summing onto it drives
// the mix past the ceiling, where the tone turns to buzz and takes the voice
// with it. The two levels together cannot reach full scale: a clip is capped at
// a 0.99 peak by its own scan, and 0.6 + 0.3 x 0.99 leaves the ending fade
// something to fade.
export const BED_LEVEL = 0.6;

// A suggestion belongs under the bed rather than over it: near-continuous
// underlay, not punctuation, and a voice at the level of the words it plays
// beneath is one the user listens to instead of hears.
export const VOICE_LEVEL = 0.3;

export type SessionAudio = {
  voice: GainNode;
  end: () => void;
  leave: () => void;
};

export function startSessionAudio(
  context: AudioContext,
  segments: Segment[],
  from: number,
): SessionAudio {
  const graph = createAudioGraph(context);
  warnIfMono(context.destination);
  const bed = runBed(context, graph.merger, bedGlides(segments), from);
  setLevels(graph, from);
  leadIn(graph.master.gain, from);
  return stops(context, graph, bed);
}

// Written once at the start and never again, the bed's least of all: a bed
// dipping under every clip would make itself an event and train the user to
// anticipate suggestions — no ducking, ever. These are the levels the
// calibration step will come to own.
function setLevels(graph: AudioGraph, from: number): void {
  graph.bed.gain.setValueAtTime(BED_LEVEL, from);
  graph.voice.gain.setValueAtTime(VOICE_LEVEL, from);
}

// masterGain rests at 1 and the lead-in is the one place it climbs.
function leadIn(master: AudioParam, from: number): void {
  master.setValueAtTime(0, from);
  master.linearRampToValueAtTime(1, from + LEAD_IN_SECONDS);
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

  return { voice: graph.voice, end, leave };
}

const SECOND = 1000;

// Teardown only once the ramp has completed, or the close is the click the ramp
// was for.
function closeAfter(context: AudioContext, seconds: number): void {
  window.setTimeout(() => void context.close(), seconds * SECOND);
}
