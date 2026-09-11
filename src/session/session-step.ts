import type { Calibration } from '../calibration/calibration';
import type { Library } from '../library/scan-library';
import { sessionRounds } from '../script/session-round';
import type { ScriptEntry } from '../script/validate-script';
import type { SurfaceHost } from '../shell/surface-host';
import { whenEscaped } from './escape-exit';
import { leaveFullscreen, whenFullscreenLeft } from './fullscreen';
import { createImageField } from './image-field';
import { runImageLayer } from './image-layer';
import { segmentOrder } from './segment-order';
import { startSessionAudio } from './session-audio';
import { anchorClock } from './session-clock';
import { AUDIO_REFUSED } from './session-copy';
import { NEVER_PAUSED, NOT_WATCHED, sessionEndings } from './session-endings';
import type { SessionParts } from './session-endings';
import { runPause } from './session-pause';
import type { PausedSession } from './session-pause';
import { renderStage } from './session-screen';
import { runSnapLayer } from './snap-layer';
import { createSpiralField } from './spiral-field';
import { runSpiralLayer } from './spiral-layer';
import { enterSession } from './start-activation';
import type { SessionEntry } from './start-activation';
import { renderStart } from './start-screen';
import type { StartScreen } from './start-screen';
import { runVoiceLayer } from './voice-layer';
import { createWordField, followViewport } from './word-field';
import { runWordLayer } from './word-layer';

export type LeaveSession = () => void;

export function showStart(
  host: SurfaceHost,
  script: ScriptEntry,
  library: Library,
  calibration: Calibration,
  leave: LeaveSession,
): void {
  function begin(): void {
    void startSession(host, script, library, calibration, screen, leave);
  }

  const screen = renderStart(script, begin, leave);
  host.show(screen.element);
}

async function startSession(
  host: SurfaceHost,
  script: ScriptEntry,
  library: Library,
  calibration: Calibration,
  screen: StartScreen,
  leave: LeaveSession,
): Promise<void> {
  const entry = await enterSession();
  if (!entry) {
    screen.fail(AUDIO_REFUSED);
    return;
  }
  runSession(host, script, library, calibration, entry, leave);
}

function runSession(
  host: SurfaceHost,
  script: ScriptEntry,
  library: Library,
  calibration: Calibration,
  entry: SessionEntry,
  leave: LeaveSession,
): void {
  // The order is drawn here and nowhere else, so every layer of the session
  // reads the same rounds: one order for the whole session where the script was
  // written to be played as written, a fresh one every round where it shuffles.
  // The length of a round is the script's however it is ordered, which is why
  // the rounds are counted off the segments as written.
  const order = segmentOrder(script.segments, script.shuffles, Math.random);
  const rounds = sessionRounds(script.segments, script.loops);
  const field = createWordField(order.playing(0).words);
  const imagery = createImageField();
  const spiral = createSpiralField();
  // Imagery first and the words last, so the spiral turns over the photograph
  // and under the word, and the halo is the only thing between the word and
  // both of them.
  const stage = renderStage([imagery.element, spiral.element, field.element]);
  const dismiss = host.raise(stage);
  const unfollow = followViewport(field);
  const startedAt = entry.context.currentTime;
  const audio = startSessionAudio(entry.context, order, calibration, startedAt, rounds);
  const elapsed = anchorClock(entry.context, startedAt);
  // The words are the one layer that reads the round rather than the session:
  // where a looping script comes round, its clock does too, and the cue that
  // would have been the last word is the first word of the round after it.
  const held = () => endings.hold();
  const wordLayer = runWordLayer(field, order, rounds, elapsed, held);
  const spiralLayer = runSpiralLayer(spiral, order, elapsed, rounds);
  const imageLayer = runImageLayer(imagery, order, library.images, elapsed, rounds);
  const voiceLayer = runVoiceLayer(
    entry.context,
    audio.voice,
    order,
    library.clips,
    elapsed,
    startedAt,
    rounds,
  );
  const snapLayer = runSnapLayer(entry.context, audio.snap, order, elapsed, startedAt, rounds);
  const parts: SessionParts = {
    audio,
    words: wordLayer,
    spiral: spiralLayer,
    imagery: imageLayer,
    voice: voiceLayer,
    snaps: snapLayer,
    wake: entry.wake,
    pause: NEVER_PAUSED,
    unwatch: NOT_WATCHED,
    dismiss,
    unfollow,
    leaveFullscreen,
  };
  const endings = sessionEndings(parts);
  const interruptible: PausedSession = {
    context: entry.context,
    audio,
    voice: voiceLayer,
    wake: entry.wake,
  };
  parts.pause = runPause(interruptible, host, endings.end);
  parts.unwatch = watchExit(entry, endings.exit);
  // Selection renders now, behind the opaque stage, so leaving the session is a
  // single synchronous dismissal on the frame the exit gesture arrives.
  leave();
}

// The same gesture either way: the key that leaves fullscreen where there is
// fullscreen, and the key itself where there is none.
function watchExit(entry: SessionEntry, leave: LeaveSession): () => void {
  if (entry.fullscreen) return whenFullscreenLeft(leave);
  return whenEscaped(leave);
}
