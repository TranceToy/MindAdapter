import type { ScreenWake } from './screen-wake';
import type { SessionAudio } from './session-audio';
import type { SessionPause } from './session-pause';

// What an ending needs of a layer, which is the same of all five, and of the
// snaps a mark sounds, which stop with them.
export type Stopping = {
  stop: () => void;
};

// The three ways audio stops, and nothing else of it: an ending picks one of
// them and the choice is the whole difference between two of these endings.
export type QuietingAudio = Pick<SessionAudio, 'end' | 'leave' | 'halt'>;

// Held as a record rather than closed over, because two of its parts are built
// round endings and cannot exist before them: the pause overlay carries End,
// and the exit watch carries the gesture. Both are written back once they do.
export type SessionParts = {
  audio: QuietingAudio;
  words: Stopping;
  spiral: Stopping;
  imagery: Stopping;
  voice: Stopping;
  snaps: Stopping;
  wake: Pick<ScreenWake, 'release'>;
  pause: SessionPause;
  unwatch: () => void;
  dismiss: () => void;
  unfollow: () => void;
  leaveFullscreen: () => void;
};

export type SessionEndings = {
  hold: () => void;
  exit: () => void;
  end: () => void;
};

export const NEVER_PAUSED: SessionPause = { paused: () => false, stop: () => {} };

export const NOT_WATCHED = (): void => {};

// The three endings a session has, as an order over parts rather than over a
// browser: the hold after the last word, the exit gesture mid-session, and End
// from the pause overlay. A looping script reaches no last word, so a session
// of one has two endings and both of them are gestures.
export function sessionEndings(parts: SessionParts): SessionEndings {
  // The triggers belong to a running session: the terminal hold is silent and
  // still, so there is nothing left in it to protect. Nothing else is taken —
  // the photograph stays where it is, the stage stays up, the lock stays held
  // and the exit watch stays bound, because the hold is a session still being
  // in one and waiting to be left.
  function hold(): void {
    parts.audio.end();
    parts.spiral.stop();
    parts.pause.stop();
  }

  // A fullscreen loss over the overlay is the same ending the overlay's own End
  // is, because the context it would fade is already suspended.
  function exit(): void {
    if (parts.pause.paused()) {
      end();
      return;
    }
    leave(parts.audio.leave);
  }

  function end(): void {
    leave(parts.audio.halt);
    parts.leaveFullscreen();
  }

  // The screen goes first and the audio last: the stage is gone on the frame the
  // gesture arrived, and whatever ramp quits the audio runs behind it.
  function leave(quit: () => void): void {
    parts.pause.stop();
    parts.dismiss();
    parts.wake.release();
    parts.unwatch();
    parts.unfollow();
    parts.words.stop();
    parts.spiral.stop();
    parts.imagery.stop();
    parts.voice.stop();
    parts.snaps.stop();
    quit();
  }

  return { hold, exit, end };
}
