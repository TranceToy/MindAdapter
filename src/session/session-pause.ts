import type { SurfaceHost } from '../shell/surface-host';
import { enterFullscreen } from './fullscreen';
import { isMono } from './output-check';
import { renderPause } from './pause-overlay';
import type { EndSession } from './pause-overlay';
import { whenInterrupted } from './pause-triggers';
import type { ScreenWake } from './screen-wake';
import type { SessionAudio } from './session-audio';
import type { VoiceLayer } from './voice-layer';

export type SessionPause = {
  paused: () => boolean;
  stop: () => void;
};

export type PausedSession = {
  context: AudioContext;
  audio: SessionAudio;
  voice: VoiceLayer;
  wake: ScreenWake;
};

export function runPause(
  session: PausedSession,
  host: SurfaceHost,
  end: EndSession,
): SessionPause {
  let lower: (() => void) | null = null;
  let entering = false;

  function pause(): void {
    if (lower) return;
    hold();
    raise();
  }

  function hold(): void {
    session.voice.drop();
    session.audio.suspend();
  }

  function raise(): void {
    const mono = isMono(session.context.destination);
    const overlay = renderPause(activate, end, mono);
    lower = host.raise(overlay);
  }

  function activate(): void {
    void resume();
  }

  // Never automatic, and the click is what pays for the fullscreen the pause may
  // have cost. The lock is renewed and the context entered again — waited on
  // rather than assumed — before the frame is handed back, and the session
  // carries on at the word it froze on with no rewind.
  async function resume(): Promise<void> {
    if (entering) return;
    entering = true;
    await enterFullscreen();
    session.wake.renew();
    await session.audio.reEnter();
    entering = false;
    settle();
  }

  // The wait for a running context is unbounded, so the window that was there at
  // the click need not still be there at the end of it, and a session must never
  // come back on its own.
  function settle(): void {
    if (document.visibilityState !== 'visible') {
      hold();
      return;
    }
    lift();
  }

  function lift(): void {
    if (!lower) return;
    lower();
    lower = null;
  }

  function paused(): boolean {
    return lower !== null;
  }

  const unwatch = whenInterrupted(session.context, pause);

  function stop(): void {
    unwatch();
    lift();
  }

  return { paused, stop };
}
