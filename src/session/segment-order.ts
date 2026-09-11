import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';
import { wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';
import { shuffled, unseamed } from './draw';
import type { Roll } from './draw';
import { sessionWords } from './session-words';

// One round as it is played: the segments in the order they come, the words
// they spend in that order, and the line those words land on.
//
// Every round is the same length whatever order it draws, because a segment's
// bed, voice, pace, gap and spiral were resolved where it was written and
// travel with it: a round is the same word counts at the same paces, summed in
// another order. That is what lets the rest of the session go on reading a
// round as a length — the selection screen's duration, the seam every layer
// counts rounds by, the swell measured off the session's own clock.
export type Playing = {
  segments: Segment[];
  words: Word[];
  times: WordTimes;
};

// What a round plays and in what order, asked a round at a time because a
// shuffled script draws a fresh order for every one of them and a looping
// script has no last round to draw ahead to.
export type SegmentOrder = {
  playing: (round: number) => Playing;
};

export function segmentOrder(segments: Segment[], shuffles: boolean, roll: Roll): SegmentOrder {
  if (!shuffles) return writtenOrder(segments);
  return drawnOrder(segments, roll);
}

// The order the author wrote, which is every round of the script: one Playing
// held for the whole session, so a layer that asks by round asks for nothing.
export function writtenOrder(segments: Segment[]): SegmentOrder {
  const held = playingOf(segments);
  return { playing: () => held };
}

// A fresh order for every round, and never the segment the round before it
// closed on at the head of the one after: the seam is the only place a shuffled
// script could say the same segment twice running, and it is re-drawn there
// rather than accepted, the way the clip bag's own seam is. Rounds are drawn
// forward and held because each is drawn against the one before it.
export function drawnOrder(segments: Segment[], roll: Roll): SegmentOrder {
  const opening = playingOf(segments);
  const drawn: Playing[] = [];

  function extend(): void {
    const running = drawn[drawn.length - 1] ?? null;
    const order = unseamed(shuffled(segments, roll), closing(running), roll);
    drawn.push(playingOf(order));
  }

  function playing(round: number): Playing {
    while (drawn.length <= round) extend();
    return drawn[round] ?? opening;
  }

  return { playing };
}

// A schedule built from the segments of a round and held until the round after
// it, so a layer that reads one every frame builds it once a round rather than
// once a frame.
export function heldByRound<T>(build: (round: number) => T): (round: number) => T {
  let held: { round: number; value: T } | null = null;
  return (round: number) => {
    if (held && held.round === round) return held.value;
    const value = build(round);
    held = { round, value };
    return value;
  };
}

function playingOf(segments: Segment[]): Playing {
  const words = sessionWords(segments);
  const times = wordTimes(segments);
  return { segments, words, times };
}

function closing(running: Playing | null): Segment | null {
  if (!running) return null;
  return running.segments[running.segments.length - 1] ?? null;
}
