import type { MeasuredClip } from '../library/clip-reconcile';
import type { ClipPool } from '../library/scan-library';
import type { Segment } from '../script/resolve-script';
import { onsetSeconds, wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';
import { fillBag } from './clip-bag';
import type { ClipBag, Roll } from './clip-bag';
import { bindClips } from './voice-pools';

// A floor rather than an average, so minimum spacing is a property of the
// cadence: two near-touching suggestions read as a malfunction however rarely
// they come.
export const GAP_LOW = 7;
export const GAP_HIGH = 15;

export type VoiceFiring = {
  at: number;
  clip: MeasuredClip;
};

type VoiceSpan = {
  from: number;
  until: number;
  tags: string[];
};

type VoiceBinding = {
  from: number;
  until: number;
  clips: MeasuredClip[];
};

type Run = {
  firings: VoiceFiring[];
  next: number;
  over: boolean;
};

// The whole session's voice is known before a word is shown, so it is a
// schedule rather than a state machine: a firing decision is made once and
// nothing later revokes it, which is what keeps a clip whole across a pool
// change and off the end of the session.
export function voiceFirings(segments: Segment[], pools: ClipPool[], roll: Roll): VoiceFiring[] {
  const times = wordTimes(segments);
  const spans = voiceSpans(segments, times);
  const bindings = boundSpans(spans, pools);
  const deadline = voiceDeadline(segments);
  return fireAcross(bindings, deadline, roll);
}

// The last word's own beat, not the fade behind it. A suggestion still speaking
// when the words stop is the one the session was meant to land on.
export function voiceDeadline(segments: Segment[]): number {
  const times = wordTimes(segments);
  return onsetSeconds(times, times.words - 1);
}

// One span per stretch a binding holds for. Consecutive segments that inherit
// the running binding are one span, so an author who splits finely for imagery
// does not keep rebuilding the bag underneath.
function voiceSpans(segments: Segment[], times: WordTimes): VoiceSpan[] {
  const spans: VoiceSpan[] = [];
  let words = 0;
  for (const segment of segments) {
    const from = onsetSeconds(times, words);
    words += segment.words.length;
    const until = onsetSeconds(times, words);
    const running = spans[spans.length - 1];
    if (running && sameTags(running.tags, segment.voice)) {
      running.until = until;
      continue;
    }
    const span = { from, until, tags: segment.voice };
    spans.push(span);
  }
  return spans;
}

function boundSpans(spans: VoiceSpan[], pools: ClipPool[]): VoiceBinding[] {
  const bindings: VoiceBinding[] = [];
  for (const span of spans) {
    const clips = bindClips(pools, span.tags);
    const binding = { from: span.from, until: span.until, clips };
    bindings.push(binding);
  }
  return bindings;
}

// The gap clock starts where a pool comes into force and is disarmed by a
// stretch that binds none, so a return from silence is a fresh cadence rather
// than a clip waiting at the boundary to pounce.
function fireAcross(bindings: VoiceBinding[], deadline: number, roll: Roll): VoiceFiring[] {
  const firings: VoiceFiring[] = [];
  let next: number | null = null;
  for (const binding of bindings) {
    if (binding.clips.length === 0) {
      next = null;
      continue;
    }
    if (next === null) next = binding.from + gapSeconds(roll);
    const bag = fillBag(binding.clips, roll);
    const run = fireWithin(bag, binding.until, next, deadline, roll);
    firings.push(...run.firings);
    if (run.over) break;
    next = run.next;
  }
  return firings;
}

// The gap is silence between suggestions, measured from the end of one to the
// start of the next, so two clips cannot overlap and there is nothing to queue.
// A clip that cannot finish in time ends the layer rather than costing a turn:
// every later firing is later still, so nothing after it would fit either.
function fireWithin(
  bag: ClipBag,
  until: number,
  from: number,
  deadline: number,
  roll: Roll,
): Run {
  const firings: VoiceFiring[] = [];
  let next = from;
  while (next < until) {
    const clip = bag.draw();
    if (!clip) break;
    if (next + clip.duration > deadline) return { firings, next, over: true };
    const firing = { at: next, clip };
    firings.push(firing);
    next = next + clip.duration + gapSeconds(roll);
  }
  return { firings, next, over: false };
}

// Uniform between its bounds, never exponential: an exponential gap clumps by
// construction, and two near-touching suggestions read as a malfunction rather
// than as chance.
export function gapSeconds(roll: Roll): number {
  return GAP_LOW + roll() * (GAP_HIGH - GAP_LOW);
}

function sameTags(one: string[], other: string[]): boolean {
  if (one.length !== other.length) return false;
  return one.every((tag, at) => tag === other[at]);
}
