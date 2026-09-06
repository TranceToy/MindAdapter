import { decodeClip } from '../library/decode-clip';
import type { ClipPool } from '../library/scan-library';
import type { Segment } from '../script/resolve-script';
import { followPosition } from './cursor';
import type { Elapsed } from './session-clock';
import { voiceFirings } from './voice-schedule';
import type { VoiceFiring } from './voice-schedule';

export type VoiceLayer = {
  stop: () => void;
};

export function runVoiceLayer(
  context: AudioContext,
  voice: GainNode,
  segments: Segment[],
  pools: ClipPool[],
  elapsed: Elapsed,
  from: number,
): VoiceLayer {
  const firings = voiceFirings(segments, pools, Math.random);
  const cursor = followPosition(elapsed);
  let running = true;

  // A clip is read while the one before it is speaking and scheduled the
  // moment it decodes, so the whole gap is spent on the read and the start
  // lands on the audio clock rather than on a frame. One clip is held at a
  // time: the schedule is drawn, the library is not.
  async function run(): Promise<void> {
    let at = 0;
    let reading = readAhead(firings[at]);
    while (at < firings.length) {
      const firing = firings[at];
      const clip = await reading;
      if (!running || !firing) break;
      if (clip) speak(clip, firing);
      const reached = await cursor.reach(firing.at);
      if (!reached) break;
      at += 1;
      reading = readAhead(firings[at]);
    }
    cursor.stop();
  }

  // A clip gone from disk since the scan costs its own turn and nothing else:
  // the gap after it was drawn before the read, so the next suggestion still
  // speaks on time.
  function readAhead(firing: VoiceFiring | undefined): Promise<AudioBuffer | null> {
    if (!firing) return Promise.resolve(null);
    return decodeClip(context, firing.clip.handle);
  }

  // The scalar the scan measured, already backed off where the normalised clip
  // would have clipped the output, so a quietly recorded suggestion and a loud
  // one sit at the same level under the same calibrated voice gain.
  function speak(clip: AudioBuffer, firing: VoiceFiring): void {
    const source = context.createBufferSource();
    const level = context.createGain();
    source.buffer = clip;
    level.gain.value = firing.clip.rmsScalar;
    source.connect(level);
    level.connect(voice);
    source.onended = () => level.disconnect();
    source.start(from + firing.at);
  }

  // Nothing sounding is stopped here. The exit ramp is already running over it
  // and the context closes behind the ramp, so a clip is faded rather than cut.
  function stop(): void {
    running = false;
    cursor.stop();
  }

  void run();
  return { stop };
}
