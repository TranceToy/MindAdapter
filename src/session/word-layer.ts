import { roundAt } from '../script/session-round';
import type { Rounds } from '../script/session-round';
import type { Elapsed } from './session-clock';
import type { Playing, SegmentOrder } from './segment-order';
import { cueAt } from './word-clock';
import type { WordCue } from './word-clock';
import type { WordField } from './word-field';

export type WordLayer = {
  stop: () => void;
};

export type LastWord = () => void;

// Where the round is read rather than only the second in it: the words are the
// layer the loop is made of, and a shuffled script holds different words at the
// same place of one round and the next, so a place is a round and an index
// together rather than an index alone.
type Shown = {
  round: number;
  index: number;
};

const NOTHING_SHOWN: Shown = { round: -1, index: -1 };

export function runWordLayer(
  field: WordField,
  order: SegmentOrder,
  rounds: Rounds,
  elapsed: Elapsed,
  ended: LastWord,
): WordLayer {
  let frame = 0;
  let shown = NOTHING_SHOWN;

  function tick(): void {
    frame = requestAnimationFrame(tick);
    const round = roundAt(rounds, elapsed());
    const playing = order.playing(round.behind);
    const cue = cueAt(playing.times, round.at);
    follow(playing, round.behind, cue);
  }

  function follow(playing: Playing, round: number, cue: WordCue): void {
    if (cue.kind === 'ended') {
      end();
      return;
    }
    if (round === shown.round && cue.index === shown.index) return;
    const word = playing.words[cue.index];
    if (!word) return;
    shown = { round, index: cue.index };
    field.show(word);
  }

  function end(): void {
    field.retire();
    stop();
    ended();
  }

  function stop(): void {
    cancelAnimationFrame(frame);
  }

  frame = requestAnimationFrame(tick);
  return { stop };
}
