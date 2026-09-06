import { describe, expect, it } from 'vitest';
import { diagnose } from './diagnose';
import type { Capabilities } from './diagnose';

const CHROMIUM: Capabilities = { audio: true, directoryPicker: true, directoryInput: true };

function without(missing: Partial<Capabilities>): Capabilities {
  return { ...CHROMIUM, ...missing };
}

describe('diagnose', () => {
  it('passes a browser that has everything', () => {
    expect(diagnose(CHROMIUM)).toBeNull();
  });

  it('passes a browser with the folder input and no picker', () => {
    expect(diagnose(without({ directoryPicker: false }))).toBeNull();
  });

  it('refuses a browser that can read no folder at all', () => {
    const bare = without({ directoryPicker: false, directoryInput: false });
    expect(diagnose(bare)).toBe('no-directory-read');
  });

  it('refuses a browser without Web Audio before anything else', () => {
    const silent = without({ audio: false, directoryPicker: false, directoryInput: false });
    expect(diagnose(silent)).toBe('no-audio');
  });
});
