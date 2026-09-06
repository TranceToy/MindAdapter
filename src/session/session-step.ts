import type { Library } from '../library/scan-library';
import type { ScriptEntry } from '../script/validate-script';
import type { SurfaceHost } from '../shell/surface-host';
import { whenFullscreenLeft } from './fullscreen';
import { createImageField } from './image-field';
import { runImageLayer } from './image-layer';
import type { ImageLayer } from './image-layer';
import { startSessionAudio } from './session-audio';
import type { SessionAudio } from './session-audio';
import { anchorClock } from './session-clock';
import { FULLSCREEN_REFUSED } from './session-copy';
import { renderStage } from './session-screen';
import { sessionWords } from './session-words';
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
  imagery: ImageLayer;
  voice: VoiceLayer;
  dismiss: () => void;
  unfollow: () => void;
  unwatch: () => void;
};

const NOTHING = () => {};

export function showStart(
  host: SurfaceHost,
  script: ScriptEntry,
  library: Library,
  leave: LeaveSession,
): void {
  function begin(): void {
    void startSession(host, script, library, screen, leave);
  }

  const screen = renderStart(script, begin, leave);
  host.show(screen.element);
}

async function startSession(
  host: SurfaceHost,
  script: ScriptEntry,
  library: Library,
  screen: StartScreen,
  leave: LeaveSession,
): Promise<void> {
  const entry = await enterSession();
  if (!entry) {
    screen.fail(FULLSCREEN_REFUSED);
    return;
  }
  runSession(host, script, library, entry, leave);
}

function runSession(
  host: SurfaceHost,
  script: ScriptEntry,
  library: Library,
  entry: SessionEntry,
  leave: LeaveSession,
): void {
  const words = sessionWords(script.segments);
  const field = createWordField(words);
  const imagery = createImageField();
  // Imagery first, so the words paint over it and the halo is the only thing
  // between them.
  const stage = renderStage([imagery.element, field.element]);
  const dismiss = host.raise(stage);
  const unfollow = followViewport(field);
  const startedAt = entry.context.currentTime;
  const audio = startSessionAudio(entry.context, script.segments, startedAt);
  const elapsed = anchorClock(entry.context, startedAt);
  const wordLayer = runWordLayer(field, words.length, elapsed, audio.end);
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
    imagery: imageLayer,
    voice: voiceLayer,
    dismiss,
    unfollow,
    unwatch: NOTHING,
  };
  session.unwatch = whenFullscreenLeft(() => stopSession(session));
  // Selection renders now, behind the opaque stage, so leaving the session is a
  // single synchronous dismissal on the frame the exit gesture arrives.
  leave();
}

function stopSession(session: Session): void {
  session.dismiss();
  session.entry.wake.release();
  session.unwatch();
  session.unfollow();
  session.words.stop();
  session.imagery.stop();
  session.voice.stop();
  session.audio.leave();
}
