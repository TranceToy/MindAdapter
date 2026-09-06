import { swells } from '../script/declaration-values';
import type { Depth, Spiral } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { onsetSeconds, wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';

const SECONDS_PER_MINUTE = 60;
const DEGREES_PER_TURN = 360;
const FULL_SWELL = Math.PI * 2;

const NOTHING_TURNING: SpiralPhase[] = [];

// One stretch turned by a single set of spirals, or by none at all: the second
// it opens on and the spirals in force from there.
export type SpiralTurn = {
  at: number;
  spirals: Spiral[];
};

// Where one spiral stands: how far it has come round since the session began,
// and how much of the photograph it takes at this second.
export type SpiralPhase = {
  angle: number;
  depth: number;
};

// The whole session's turning is known before a word is shown, so it is a
// schedule rather than a state machine. A new rate lands on the beat of the
// first word of the segment that declares it, as a bed pair does.
export function spiralTurns(segments: Segment[]): SpiralTurn[] {
  const times = wordTimes(segments);
  const opening = segments[0]?.spirals ?? [];
  const turns: SpiralTurn[] = [{ at: 0, spirals: opening }];
  let running = opening;
  let words = 0;
  for (const segment of segments) {
    if (!sameSpirals(segment.spirals, running)) turns.push(turnAt(times, words, segment.spirals));
    running = segment.spirals;
    words += segment.words.length;
  }
  return turns;
}

// The angles are carried across the turns rather than measured from the last
// one, so a rate change is a change of speed and never a jump, and a stretch
// that turns fewer spirals leaves the angles where it stopped them for the next
// one to take up.
export function spiralAt(turns: SpiralTurn[], elapsed: number): SpiralPhase[] {
  const angles: number[] = [];
  let held: SpiralTurn | null = null;
  for (const turn of turns) {
    if (turn.at > elapsed) break;
    if (held) sweepInto(angles, held.spirals, turn.at - held.at);
    held = turn;
  }
  if (!held) return NOTHING_TURNING;
  sweepInto(angles, held.spirals, elapsed - held.at);
  return phasesOf(held.spirals, angles, elapsed);
}

// Each spiral is carried by its place in the declaration, which is what makes a
// pair that loses one and takes it up again take it up where it stopped.
function sweepInto(angles: number[], spirals: Spiral[], seconds: number): void {
  spirals.forEach((spiral, place) => {
    const turned = angles[place] ?? 0;
    angles[place] = turned + sweep(spiral, seconds);
  });
}

function phasesOf(spirals: Spiral[], angles: number[], elapsed: number): SpiralPhase[] {
  return spirals.map((spiral, place) => {
    const angle = angles[place] ?? 0;
    const depth = depthAt(spiral.depth, elapsed);
    return { angle, depth };
  });
}

// A rate below zero sweeps backwards, which is why the angle is signed and
// nothing else here reads it: a reversal is a rate passing through zero, not a
// state the schedule holds, and a pair turning against each other is one rate
// of each sign.
function sweep(spiral: Spiral, seconds: number): number {
  return (spiral.rate * DEGREES_PER_TURN * seconds) / SECONDS_PER_MINUTE;
}

// The swell rides the session's own clock rather than the turn that declared
// it, so a change of rate under an unchanged swell moves the speed without
// stepping the depth. It is a cosine and not a sawtooth, so the depth turns
// round at its far bound rather than snapping back to the near one.
function depthAt(depth: Depth, elapsed: number): number {
  if (!swells(depth)) return depth.from;
  const swept = (1 - Math.cos((elapsed / depth.seconds) * FULL_SWELL)) / 2;
  return depth.from + (depth.to - depth.from) * swept;
}

function turnAt(times: WordTimes, word: number, spirals: Spiral[]): SpiralTurn {
  return { at: onsetSeconds(times, word), spirals };
}

function sameSpirals(left: Spiral[], right: Spiral[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((spiral, place) => sameSpiral(spiral, right[place]));
}

function sameSpiral(left: Spiral, right: Spiral | undefined): boolean {
  if (!right) return false;
  return left.rate === right.rate && sameDepth(left.depth, right.depth);
}

function sameDepth(left: Depth, right: Depth): boolean {
  return left.from === right.from && left.to === right.to && left.seconds === right.seconds;
}
