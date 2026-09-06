import type { MeasuredClip } from '../library/clip-reconcile';
import { decodeClip } from '../library/decode-clip';
import type { ClipPool } from '../library/scan-library';
import { DEFAULT_BED, DEFAULT_GAP } from '../script/declaration-values';
import { createAudioGraph } from '../session/audio-graph';
import { runBed } from '../session/bed-layer';
import { fillBag } from '../session/clip-bag';
import { DECLICK_SECONDS, rampGain } from '../session/gain-ramp';
import { EXIT_SECONDS } from '../session/session-audio';
import { bindClips } from '../session/voice-pools';
import { gapSeconds } from '../session/voice-schedule';
import { bedLevel, voiceLevel } from './calibration';
import type { Calibration } from './calibration';

// The screen cross-fades in over this, so the bed arrives under it rather than
// as a click at whatever level was last set.
const ARRIVAL_SECONDS = 0.2;

const SECOND = 1000;

export type CalibrationPreview = {
  set: (calibration: Calibration) => void;
  stop: () => void;
};

// The session's own graph and the session's own cadence, so what is set here is
// set against what will be heard: the bed on its defaults, suggestions drawn
// from the whole library at the gaps a session draws.
export function startPreview(pools: ClipPool[], opening: Calibration): CalibrationPreview {
  const context = new AudioContext();
  const graph = createAudioGraph(context);
  const glides = [{ at: 0, bed: DEFAULT_BED }];
  const bed = runBed(context, graph.merger, glides, context.currentTime);
  const clips = everyClip(pools);
  const bag = fillBag(clips, Math.random);
  let running = true;

  function set(calibration: Calibration): void {
    hold(graph.bed.gain, bedLevel(calibration));
    hold(graph.voice.gain, voiceLevel(calibration));
  }

  // A drag writes a level on every frame it moves, and ramping each write is
  // what keeps a moving track from sounding like one.
  function hold(gain: AudioParam, level: number): void {
    rampGain(gain, level, DECLICK_SECONDS, context.currentTime);
  }

  // One clip at a time, read when its turn comes rather than ahead: nothing here
  // is scheduled against a clock, so a read that takes a moment costs a moment.
  async function speakOnCycle(): Promise<void> {
    while (running) {
      const clip = bag.draw();
      if (!clip) return;
      const buffer = await decodeClip(context, clip.handle);
      if (!running) return;
      if (buffer) speak(context, graph.voice, buffer, clip.rmsScalar);
      const spoken = buffer ? buffer.duration : 0;
      await rest(spoken + gapSeconds(DEFAULT_GAP, Math.random));
    }
  }

  function stop(): void {
    running = false;
    const done = rampGain(graph.master.gain, 0, EXIT_SECONDS, context.currentTime);
    bed.stop(done);
    closeAfter(context, done - context.currentTime);
  }

  set(opening);
  fadeIn(graph.master.gain, context.currentTime);
  void resumeQuietly(context);
  void speakOnCycle();
  return { set, stop };
}

function everyClip(pools: ClipPool[]): MeasuredClip[] {
  const tags = pools.map((pool) => pool.tag);
  return bindClips(pools, tags);
}

// The clip carries the scalar its scan measured, so the voice track is set
// against the level every suggestion will speak at rather than against this one.
function speak(
  context: AudioContext,
  voice: GainNode,
  buffer: AudioBuffer,
  scalar: number,
): void {
  const source = context.createBufferSource();
  const level = context.createGain();
  source.buffer = buffer;
  level.gain.value = scalar;
  source.connect(level);
  level.connect(voice);
  source.onended = () => level.disconnect();
  source.start();
}

function fadeIn(master: AudioParam, from: number): void {
  master.setValueAtTime(0, from);
  master.linearRampToValueAtTime(1, from + ARRIVAL_SECONDS);
}

// The arrival click already gave the document its activation, so a context that
// starts suspended is a formality rather than a refusal.
async function resumeQuietly(context: AudioContext): Promise<void> {
  try {
    await context.resume();
  } catch {
    // A failed resume costs the preview its sound, not the screen its levels.
  }
}

function rest(seconds: number): Promise<void> {
  return new Promise((settle) => window.setTimeout(settle, seconds * SECOND));
}

function closeAfter(context: AudioContext, seconds: number): void {
  window.setTimeout(() => void context.close(), seconds * SECOND);
}
