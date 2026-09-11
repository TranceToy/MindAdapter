import type { Segment } from '../script/resolve-script';
import type { Rounds } from '../script/session-round';
import { watchRounds } from './round-watch';
import type { ArmRound, RoundWatch } from './round-watch';
import type { Elapsed } from './session-clock';
import { snapBeats } from './snap-schedule';
import { loadSnap, strikeSnap } from './snap-sound';
import type { Snap } from './snap-sound';

export type SnapLayer = {
  stop: () => void;
};

export function runSnapLayer(
  context: AudioContext,
  snap: GainNode,
  segments: Segment[],
  elapsed: Elapsed,
  from: number,
  rounds: Rounds,
): SnapLayer {
  const beats = snapBeats(segments);
  let watch: RoundWatch | null = null;
  let running = true;

  // Every snap of a round is scheduled in one pass, unlike a clip, because the
  // sound is held in memory rather than read off the library: there is nothing
  // to read ahead for, and a start written in context time is frozen with the
  // words by a pause and cannot drift from the beat it belongs to. A round at a
  // time rather than a session, because a looping script has no last beat.
  async function arm(): Promise<void> {
    const sound = await loadSnap(context);
    if (!sound || !running) return;
    const armWith: ArmRound = (round) => armRound(sound, round);
    watch = watchRounds(elapsed, rounds, armWith);
  }

  // Beats already passed while the sound was loading are dropped, since a snap
  // late is a snap on the wrong word.
  function armRound(sound: Snap, round: number): void {
    const opened = round * rounds.seconds;
    for (const beat of beats) {
      const at = opened + beat;
      if (at < elapsed()) continue;
      strikeSnap(context, snap, sound, from + at);
    }
  }

  // Nothing scheduled is cancelled here, as nothing sounding is in the voice
  // layer: the exit ramp is already running over the snaps still ahead and the
  // context closes behind it, so what is left of them is faded rather than cut.
  // The flag is for the load still in flight, which must not arm a session that
  // has already been left.
  function stop(): void {
    running = false;
    watch?.stop();
  }

  void arm();
  return { stop };
}
