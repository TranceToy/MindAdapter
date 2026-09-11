import type { Rounds } from '../script/session-round';
import { followPosition } from './cursor';
import type { Elapsed } from './session-clock';

export type ArmRound = (round: number) => void;

export type RoundWatch = {
  stop: () => void;
};

const OPENING_ROUND = 0;
const NOT_WATCHED: RoundWatch = { stop: () => {} };

// The three layers that write into the audio clock ahead of the words — the
// bed, the voice and the snaps — can only write a round at a time, because a
// looping script has no last round to write. Each round is armed while the one
// before it is still running, so a sound that lands on the first beat of a
// round is already scheduled by the time the words come round to it. A script
// that does not loop is one round, armed where it stands and never watched.
export function watchRounds(elapsed: Elapsed, rounds: Rounds, arm: ArmRound): RoundWatch {
  if (!rounds.loops) {
    arm(OPENING_ROUND);
    return NOT_WATCHED;
  }
  const cursor = followPosition(elapsed);
  let running = true;

  async function run(): Promise<void> {
    arm(OPENING_ROUND);
    arm(OPENING_ROUND + 1);
    let next = OPENING_ROUND + 2;
    while (running) {
      const reached = await cursor.reach((next - 1) * rounds.seconds);
      if (!reached) return;
      arm(next);
      next += 1;
    }
  }

  function stop(): void {
    running = false;
    cursor.stop();
  }

  void run();
  return { stop };
}
