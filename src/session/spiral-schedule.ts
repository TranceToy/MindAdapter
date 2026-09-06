import type { Spiral } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { onsetSeconds, wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';

const SECONDS_PER_MINUTE = 60;
const DEGREES_PER_TURN = 360;

// One stretch turned at a single rate, or not turned at all: the second it
// opens on and the spiral in force from there.
export type SpiralTurn = {
  at: number;
  spiral: Spiral | null;
};

// Where the spiral stands: how far it has come round since the session began,
// and how much of the photograph it takes.
export type SpiralPhase = {
  angle: number;
  depth: number;
};

// The whole session's turning is known before a word is shown, so it is a
// schedule rather than a state machine. A new rate lands on the beat of the
// first word of the segment that declares it, as a bed pair does.
export function spiralTurns(segments: Segment[]): SpiralTurn[] {
  const times = wordTimes(segments);
  const opening = segments[0]?.spiral ?? null;
  const turns: SpiralTurn[] = [{ at: 0, spiral: opening }];
  let running = opening;
  let words = 0;
  for (const segment of segments) {
    if (!sameSpiral(segment.spiral, running)) turns.push(turnAt(times, words, segment.spiral));
    running = segment.spiral;
    words += segment.words.length;
  }
  return turns;
}

// The angle is carried across the turns rather than measured from the last one,
// so a rate change is a change of speed and never a jump, and a stretch that
// declares no spiral leaves the angle where it stopped for the next one to
// take up.
export function spiralAt(turns: SpiralTurn[], elapsed: number): SpiralPhase | null {
  let angle = 0;
  let held: SpiralTurn | null = null;
  for (const turn of turns) {
    if (turn.at > elapsed) break;
    if (held) angle += sweep(held.spiral, turn.at - held.at);
    held = turn;
  }
  if (!held?.spiral) return null;
  angle += sweep(held.spiral, elapsed - held.at);
  return { angle, depth: held.spiral.depth };
}

function sweep(spiral: Spiral | null, seconds: number): number {
  if (!spiral) return 0;
  return (spiral.rate * DEGREES_PER_TURN * seconds) / SECONDS_PER_MINUTE;
}

function turnAt(times: WordTimes, word: number, spiral: Spiral | null): SpiralTurn {
  return { at: onsetSeconds(times, word), spiral };
}

function sameSpiral(left: Spiral | null, right: Spiral | null): boolean {
  if (!left || !right) return left === right;
  return left.rate === right.rate && left.depth === right.depth;
}
