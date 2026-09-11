import { swells } from '../script/declaration-values';
import type { Depth, Spiral } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { roundAt } from '../script/session-round';
import type { Rounds } from '../script/session-round';
import { onsetSeconds, wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';
import { heldByRound } from './segment-order';
import type { SegmentOrder } from './segment-order';

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

// A script's turning read as a session's rather than as a round's: the turns a
// round holds, asked for by round since a shuffled script turns them in a
// different order every round, and the angle each place has swept by the end of
// a round, which is what every round after the first takes up from.
//
// The carried angle is one set of numbers for every round, not one per round:
// what a place sweeps across a round is its rate times its seconds summed over
// the segments that declare it, and a sum does not care what order it is taken
// in. A shuffled round turns the same amount as the written one and hands the
// round after it the same angle.
export type Turning = {
  turns: (round: number) => SpiralTurn[];
  carried: number[];
  rounds: Rounds;
};

// How far every place has swept by a second, and the turn in force there.
type Sweep = {
  held: SpiralTurn | null;
  angles: number[];
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

export function spiralTurning(order: SegmentOrder, rounds: Rounds): Turning {
  const turns = heldByRound((round: number) => spiralTurns(order.playing(round).segments));
  const carried = sweptTo(turns(0), rounds.seconds).angles;
  return { turns, carried, rounds };
}

// The angles are carried across the turns rather than measured from the last
// one, so a rate change is a change of speed and never a jump, and a stretch
// that turns fewer spirals leaves the angles where it stopped them for the next
// one to take up. They are carried across the seam a looping script comes round
// on for the same reason: the head's rate is a rate change like any other, and
// the spiral takes it up where the last segment left it rather than snapping
// back to the top. The depth is read off the session's own second and not the
// round's, so a swell goes on swelling through the seam rather than stepping
// back to where it opened.
export function spiralAt(turning: Turning, elapsed: number): SpiralPhase[] {
  const round = roundAt(turning.rounds, elapsed);
  const swept = sweptTo(turning.turns(round.behind), round.at);
  if (!swept.held) return NOTHING_TURNING;
  const angles = carriedInto(swept.angles, turning.carried, round.behind);
  return phasesOf(swept.held.spirals, angles, elapsed);
}

function sweptTo(turns: SpiralTurn[], at: number): Sweep {
  const angles: number[] = [];
  let held: SpiralTurn | null = null;
  for (const turn of turns) {
    if (turn.at > at) break;
    if (held) sweepInto(angles, held.spirals, turn.at - held.at);
    held = turn;
  }
  if (held) sweepInto(angles, held.spirals, at - held.at);
  return { held, angles };
}

function carriedInto(angles: number[], carried: number[], behind: number): number[] {
  if (behind === 0) return angles;
  return angles.map((angle, place) => angle + behind * (carried[place] ?? 0));
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
