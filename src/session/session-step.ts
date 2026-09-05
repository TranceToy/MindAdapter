import type { ScriptEntry } from '../script/validate-script';
import type { SurfaceHost } from '../shell/surface-host';
import { whenFullscreenLeft } from './fullscreen';
import { anchorClock } from './session-clock';
import { FULLSCREEN_REFUSED } from './session-copy';
import { renderStage } from './session-screen';
import { sessionWords } from './session-words';
import { enterSession } from './start-activation';
import type { SessionEntry } from './start-activation';
import { renderStart } from './start-screen';
import type { StartScreen } from './start-screen';
import { createWordField, followViewport } from './word-field';
import { runWordLayer } from './word-layer';
import type { WordLayer } from './word-layer';

export type LeaveSession = () => void;

type Session = {
  entry: SessionEntry;
  layer: WordLayer;
  dismiss: () => void;
  unfollow: () => void;
  unwatch: () => void;
};

const NOTHING = () => {};

export function showStart(host: SurfaceHost, script: ScriptEntry, leave: LeaveSession): void {
  function begin(): void {
    void startSession(host, script, screen, leave);
  }

  const screen = renderStart(script, begin, leave);
  host.show(screen.element);
}

async function startSession(
  host: SurfaceHost,
  script: ScriptEntry,
  screen: StartScreen,
  leave: LeaveSession,
): Promise<void> {
  const entry = await enterSession();
  if (!entry) {
    screen.fail(FULLSCREEN_REFUSED);
    return;
  }
  runSession(host, script, entry, leave);
}

function runSession(
  host: SurfaceHost,
  script: ScriptEntry,
  entry: SessionEntry,
  leave: LeaveSession,
): void {
  const words = sessionWords(script.segments);
  const field = createWordField(words);
  const stage = renderStage([field.element]);
  const dismiss = host.raise(stage);
  const unfollow = followViewport(field);
  const layer = runWordLayer(field, words.length, anchorClock(entry.context));
  const session: Session = { entry, layer, dismiss, unfollow, unwatch: NOTHING };
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
  session.layer.stop();
  void session.entry.context.close();
}
