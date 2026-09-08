import { describe, expect, it } from 'vitest';
import { NEVER_PAUSED, NOT_WATCHED, sessionEndings } from './session-endings';
import type { SessionParts, Stopping } from './session-endings';

type Log = string[];

function stopping(log: Log, name: string): Stopping {
  return {
    stop: () => {
      log.push(`${name} stopped`);
    },
  };
}

function parts(log: Log, paused = false): SessionParts {
  return {
    audio: {
      end: () => log.push('audio ended'),
      leave: () => log.push('audio left'),
      halt: () => log.push('audio halted'),
    },
    words: stopping(log, 'words'),
    spiral: stopping(log, 'spiral'),
    imagery: stopping(log, 'imagery'),
    voice: stopping(log, 'voice'),
    wake: { release: () => log.push('wake released') },
    pause: { paused: () => paused, stop: () => log.push('pause stopped') },
    unwatch: () => log.push('exit unwatched'),
    dismiss: () => log.push('stage dismissed'),
    unfollow: () => log.push('viewport unfollowed'),
    leaveFullscreen: () => log.push('fullscreen left'),
  };
}

const TEARDOWN = [
  'pause stopped',
  'stage dismissed',
  'wake released',
  'exit unwatched',
  'viewport unfollowed',
  'words stopped',
  'spiral stopped',
  'imagery stopped',
  'voice stopped',
];

function times(log: Log, call: string): number {
  return log.filter((made) => made === call).length;
}

describe('the hold after the last word', () => {
  it('takes the audio out over its ramp, stops the spiral and drops the triggers', () => {
    const log: Log = [];
    sessionEndings(parts(log)).hold();
    expect(log).toEqual(['audio ended', 'spiral stopped', 'pause stopped']);
  });

  it('leaves the photograph where it is', () => {
    const log: Log = [];
    sessionEndings(parts(log)).hold();
    expect(log).not.toContain('imagery stopped');
    expect(log).not.toContain('stage dismissed');
  });

  it('keeps the screen awake and the exit gesture watched, since the hold is left by hand', () => {
    const log: Log = [];
    sessionEndings(parts(log)).hold();
    expect(log).not.toContain('wake released');
    expect(log).not.toContain('exit unwatched');
  });

  it('is left by the exit gesture, which stops the rest of it', () => {
    const log: Log = [];
    const endings = sessionEndings(parts(log));
    endings.hold();
    log.length = 0;
    endings.exit();
    expect(log).toEqual([...TEARDOWN, 'audio left']);
  });
});

describe('an exit gesture mid-session', () => {
  it('stops every layer, releases the lock, drops the watch and dismisses the stage', () => {
    const log: Log = [];
    sessionEndings(parts(log)).exit();
    expect(log).toEqual([...TEARDOWN, 'audio left']);
  });

  it('leaves the audio through its ramp rather than cutting it', () => {
    const log: Log = [];
    sessionEndings(parts(log)).exit();
    expect(log).not.toContain('audio halted');
  });

  it('leaves fullscreen alone, since the gesture is the browser already leaving it', () => {
    const log: Log = [];
    sessionEndings(parts(log)).exit();
    expect(log).not.toContain('fullscreen left');
  });

  it('ends the session instead where the overlay is already up', () => {
    const log: Log = [];
    sessionEndings(parts(log, true)).exit();
    expect(log).toEqual([...TEARDOWN, 'audio halted', 'fullscreen left']);
  });
});

describe('End from the pause overlay', () => {
  it('stops every layer, then quits the audio and leaves fullscreen by hand', () => {
    const log: Log = [];
    sessionEndings(parts(log, true)).end();
    expect(log).toEqual([...TEARDOWN, 'audio halted', 'fullscreen left']);
  });

  it('quits the audio without a ramp, since the pause has already silenced it', () => {
    const log: Log = [];
    sessionEndings(parts(log, true)).end();
    expect(log).not.toContain('audio left');
  });

  it('reads the overlay it was built before, once the overlay is bound back', () => {
    const log: Log = [];
    const bound = parts(log);
    bound.pause = NEVER_PAUSED;
    bound.unwatch = NOT_WATCHED;
    const endings = sessionEndings(bound);
    bound.pause = { paused: () => true, stop: () => log.push('pause stopped') };
    bound.unwatch = () => log.push('exit unwatched');
    endings.exit();
    expect(log).toEqual([...TEARDOWN, 'audio halted', 'fullscreen left']);
  });
});

describe('what an ending leaves running', () => {
  it('leaves no layer, watch or follow running after an exit gesture', () => {
    const log: Log = [];
    sessionEndings(parts(log)).exit();
    for (const call of TEARDOWN) expect(times(log, call)).toBe(1);
  });

  it('leaves no layer, watch or follow running after End', () => {
    const log: Log = [];
    sessionEndings(parts(log, true)).end();
    for (const call of TEARDOWN) expect(times(log, call)).toBe(1);
  });

  it('quits the audio exactly once, however the session ends', () => {
    const log: Log = [];
    sessionEndings(parts(log, true)).exit();
    expect(times(log, 'audio halted')).toBe(1);
    expect(times(log, 'audio left')).toBe(0);
    expect(times(log, 'audio ended')).toBe(0);
  });

  it('holds nothing against an unbound overlay and an unbound watch', () => {
    const log: Log = [];
    const unbound = parts(log);
    unbound.pause = NEVER_PAUSED;
    unbound.unwatch = NOT_WATCHED;
    sessionEndings(unbound).exit();
    expect(log).toEqual([
      'stage dismissed',
      'wake released',
      'viewport unfollowed',
      'words stopped',
      'spiral stopped',
      'imagery stopped',
      'voice stopped',
      'audio left',
    ]);
  });
});
