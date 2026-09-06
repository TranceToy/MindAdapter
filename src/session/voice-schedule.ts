import type { MeasuredClip } from '../library/clip-reconcile';
import type { ClipPool } from '../library/scan-library';
import { DEFAULT_GAP } from '../script/declaration-values';
import type { Gap } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { onsetSeconds, wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';
import { fillBag } from './clip-bag';
import type { ClipBag, Roll } from './clip-bag';
import { bindClips } from './voice-pools';

export type VoiceFiring = {
  at: number;
  clip: MeasuredClip;
};

// What the script asks the silence to be, from the beat of the first word of the
// segment that asks it.
type GapHold = {
  at: number;
  gap: Gap;
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
  const holds = gapHolds(segments, times);
  const deadline = voiceDeadline(segments);
  return fireAcross(bindings, holds, deadline, roll);
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

// A line of its own rather than a property of the span, so a segment that
// changes only the cadence leaves the bag where it stands: what a script says
// about the silence has nothing to say about which suggestion is heard next.
function gapHolds(segments: Segment[], times: WordTimes): GapHold[] {
  const opening = segments[0]?.gap ?? DEFAULT_GAP;
  const holds: GapHold[] = [{ at: 0, gap: opening }];
  let running = opening;
  let words = 0;
  for (const segment of segments) {
    if (!sameGap(segment.gap, running)) holds.push(holdAt(times, words, segment.gap));
    running = segment.gap;
    words += segment.words.length;
  }
  return holds;
}

function holdAt(times: WordTimes, word: number, gap: Gap): GapHold {
  return { at: onsetSeconds(times, word), gap };
}

// The gap is drawn where the silence begins, so the segment a clip started
// under decides how long that clip is, and the segment it ends under decides how
// long the quiet after it is.
function gapInForce(holds: GapHold[], at: number): Gap {
  let running = DEFAULT_GAP;
  for (const hold of holds) {
    if (hold.at > at) break;
    running = hold.gap;
  }
  return running;
}

// The gap clock starts where a pool comes into force and is disarmed by a
// stretch that binds none, so a return from silence is a fresh cadence rather
// than a clip waiting at the boundary to pounce.
function fireAcross(
  bindings: VoiceBinding[],
  holds: GapHold[],
  deadline: number,
  roll: Roll,
): VoiceFiring[] {
  const firings: VoiceFiring[] = [];
  let next: number | null = null;
  for (const binding of bindings) {
    if (binding.clips.length === 0) {
      next = null;
      continue;
    }
    if (next === null) next = binding.from + drawGap(holds, binding.from, roll);
    const bag = fillBag(binding.clips, roll);
    const run = fireWithin(bag, binding.until, next, { holds, deadline, roll });
    firings.push(...run.firings);
    if (run.over) break;
    next = run.next;
  }
  return firings;
}

type Cadence = {
  holds: GapHold[];
  deadline: number;
  roll: Roll;
};

// The gap is silence between suggestions, measured from the end of one to the
// start of the next, so two clips cannot overlap and there is nothing to queue.
// A clip that cannot finish in time ends the layer rather than costing a turn:
// every later firing is later still, so nothing after it would fit either.
function fireWithin(bag: ClipBag, until: number, from: number, cadence: Cadence): Run {
  const firings: VoiceFiring[] = [];
  let next = from;
  while (next < until) {
    const clip = bag.draw();
    if (!clip) break;
    if (next + clip.duration > cadence.deadline) return { firings, next, over: true };
    const firing = { at: next, clip };
    firings.push(firing);
    const ends = next + clip.duration;
    next = ends + drawGap(cadence.holds, ends, cadence.roll);
  }
  return { firings, next, over: false };
}

function drawGap(holds: GapHold[], at: number, roll: Roll): number {
  const gap = gapInForce(holds, at);
  return gapSeconds(gap, roll);
}

// Uniform between its bounds, never exponential: an exponential gap clumps by
// construction, and two near-touching suggestions read as a malfunction rather
// than as chance. Bounds alike are a silence that always lasts as long, drawn
// off the same line.
export function gapSeconds(gap: Gap, roll: Roll): number {
  return gap.low + roll() * (gap.high - gap.low);
}

function sameGap(one: Gap, other: Gap): boolean {
  return one.low === other.low && one.high === other.high;
}

function sameTags(one: string[], other: string[]): boolean {
  if (one.length !== other.length) return false;
  return one.every((tag, at) => tag === other[at]);
}
