import type { Calibration } from '../calibration/calibration';
import type { Library } from '../library/scan-library';
import type { ScriptEntry } from '../script/validate-script';
import { wordTimes } from '../script/word-times';
import type { SurfaceHost } from '../shell/surface-host';
import { whenEscaped } from './escape-exit';
import { leaveFullscreen, whenFullscreenLeft } from './fullscreen';
import { createImageField } from './image-field';
import { runImageLayer } from './image-layer';
import type { ImageLayer } from './image-layer';
import { startSessionAudio } from './session-audio';
import type { SessionAudio } from './session-audio';
import { anchorClock } from './session-clock';
import { AUDIO_REFUSED } from './session-copy';
import { runPause } from './session-pause';
import type { PausedSession, SessionPause } from './session-pause';
import { renderStage } from './session-screen';
import { sessionWords } from './session-words';
import { createSpiralField } from './spiral-field';
import { runSpiralLayer } from './spiral-layer';
import type { SpiralLayer } from './spiral-layer';
import { enterSession } from './start-activation';
import type { SessionEntry } from './start-activation';
import { renderStart } from './start-screen';
import type { StartScreen } from './start-screen';
import { runVoiceLayer } from './voice-layer';
import type { VoiceLayer } from './voice-layer';
import { createWordField, followViewport } from './word-field';
import { runWordLayer } from './word-layer';
import type { WordLayer } from './word-layer';

export type LeaveSession = () => void;

type Session = {
  entry: SessionEntry;
  audio: SessionAudio;
  words: WordLayer;
  spiral: SpiralLayer;
  imagery: ImageLayer;
  voice: VoiceLayer;
  pause: SessionPause;
  dismiss: () => void;
  unfollow: () => void;
  unwatch: () => void;
};

const NOTHING = () => {};

const NEVER_PAUSED: SessionPause = { paused: () => false, stop: NOTHING };

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
  const words = sessionWords(script.segments);
  const times = wordTimes(script.segments);
  const field = createWordField(words);
  const imagery = createImageField();
  const spiral = createSpiralField();
  // Imagery first and the words last, so the spiral turns over the photograph
  // and under the word, and the halo is the only thing between the word and
  // both of them.
  const stage = renderStage([imagery.element, spiral.element, field.element]);
  const dismiss = host.raise(stage);
  const unfollow = followViewport(field);
  const startedAt = entry.context.currentTime;
  const audio = startSessionAudio(entry.context, script.segments, calibration, startedAt);
  const elapsed = anchorClock(entry.context, startedAt);
  // The triggers belong to a running session: the terminal hold is silent and
  // still, so there is nothing left in it to protect.
  function hold(): void {
    audio.end();
    session.spiral.stop();
    session.pause.stop();
  }

  const wordLayer = runWordLayer(field, times, elapsed, hold);
  const spiralLayer = runSpiralLayer(spiral, script.segments, elapsed);
  const imageLayer = runImageLayer(imagery, script.segments, library.images, elapsed);
  const voiceLayer = runVoiceLayer(
    entry.context,
    audio.voice,
    script.segments,
    library.clips,
    elapsed,
    startedAt,
  );
  const session: Session = {
    entry,
    audio,
    words: wordLayer,
    spiral: spiralLayer,
    imagery: imageLayer,
    voice: voiceLayer,
    pause: NEVER_PAUSED,
    dismiss,
    unfollow,
    unwatch: NOTHING,
  };
  const interruptible: PausedSession = {
    context: entry.context,
    audio,
    voice: voiceLayer,
    wake: entry.wake,
  };
  session.pause = runPause(interruptible, host, () => endSession(session));
  session.unwatch = watchExit(entry, () => stopSession(session));
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

// A fullscreen loss over the overlay is the same ending the overlay's own End
// is, because the context it would fade is already suspended.
function stopSession(session: Session): void {
  if (session.pause.paused()) {
    endSession(session);
    return;
  }
  leaveSession(session, session.audio.leave);
}

function endSession(session: Session): void {
  leaveSession(session, session.audio.halt);
  leaveFullscreen();
}

function leaveSession(session: Session, quit: () => void): void {
  session.pause.stop();
  session.dismiss();
  session.entry.wake.release();
  session.unwatch();
  session.unfollow();
  session.words.stop();
  session.spiral.stop();
  session.imagery.stop();
  session.voice.stop();
  quit();
}
