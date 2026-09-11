import type { MeasuredClip } from '../library/clip-reconcile';
import type { ClipPool } from '../library/scan-library';
import { DEFAULT_GAP } from '../script/declaration-values';
import type { Gap } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import type { Rounds } from '../script/session-round';
import { onsetSeconds, wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';
import { fillBag } from './clip-bag';
import type { ClipBag } from './clip-bag';
import type { Roll } from './draw';
import type { SegmentOrder } from './segment-order';
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

// One round's worth of voice, and where the silence after its last clip runs
// out — which is past the end of the round whenever a suggestion was still
// speaking there, and nothing at all where the round ended on a stretch that
// binds no clips.
type VoiceRound = {
  firings: VoiceFiring[];
  next: number | null;
};

// The session's voice rather than a round's, read one firing at a time: a
// looping script has no last suggestion to schedule, so a round is drawn only
// once the round before it runs out of firings.
export type VoiceLine = {
  firing: (place: number) => VoiceFiring | null;
};

// A round that comes round has no deadline: there is no last word for a clip to
// run past, so a suggestion started near the seam speaks on over the first words
// of the round after it, and the silence it owes is carried there with it.
const NO_DEADLINE = Number.POSITIVE_INFINITY;

// A round's voice is known before a word of it is shown, so it is a schedule
// rather than a state machine: a firing decision is made once and nothing later
// revokes it, which is what keeps a clip whole across a pool change and off the
// end of the session.
//
// Every round draws its own suggestions, so a script heard twice is not heard
// twice over: what repeats is the writing, never the order the library is drawn
// in. The cadence carries across the seam rather than restarting on it, so the
// silence a round ends in is the silence the round after it opens on. A round's
// own segments are asked for as it is drawn, since a shuffled script binds its
// pools in a different order every round while the round stays the same length.
export function voiceLine(
  order: SegmentOrder,
  pools: ClipPool[],
  rounds: Rounds,
  roll: Roll,
): VoiceLine {
  const deadline = rounds.loops ? NO_DEADLINE : voiceDeadline(order.playing(0).segments);
  const drawn: VoiceFiring[] = [];
  let behind = 0;
  let opening: number | null = null;
  let spent = false;

  function extend(): void {
    const segments = order.playing(behind).segments;
    const round = fireRound(segments, pools, deadline, opening, roll);
    for (const firing of round.firings) drawn.push(shifted(firing, behind * rounds.seconds));
    opening = round.next === null ? null : round.next - rounds.seconds;
    behind += 1;
    // A round that fires nothing and carries nothing is a script with no voice
    // in it at all, since every round of it is drawn from the same bindings.
    if (!rounds.loops || (round.firings.length === 0 && round.next === null)) spent = true;
  }

  function firing(place: number): VoiceFiring | null {
    while (place >= drawn.length) {
      if (spent) return null;
      extend();
    }
    return drawn[place] ?? null;
  }

  return { firing };
}

function shifted(firing: VoiceFiring, seconds: number): VoiceFiring {
  if (seconds === 0) return firing;
  return { at: firing.at + seconds, clip: firing.clip };
}

function fireRound(
  segments: Segment[],
  pools: ClipPool[],
  deadline: number,
  opening: number | null,
  roll: Roll,
): VoiceRound {
  const times = wordTimes(segments);
  const spans = voiceSpans(segments, times);
  const bindings = boundSpans(spans, pools);
  const holds = gapHolds(segments, times);
  return fireAcross(bindings, holds, deadline, opening, roll);
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
  opening: number | null,
  roll: Roll,
): VoiceRound {
  const firings: VoiceFiring[] = [];
  let next = opening;
  for (const binding of bindings) {
    if (binding.clips.length === 0) {
      next = null;
      continue;
    }
    if (next === null) next = binding.from + drawGap(holds, binding.from, roll);
    const bag = fillBag(binding.clips, roll);
    const run = fireWithin(bag, binding.until, next, { holds, deadline, roll });
    firings.push(...run.firings);
    if (run.over) return { firings, next: null };
    next = run.next;
  }
  return { firings, next };
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
