import { describe, expect, it } from 'vitest';
import { isScript, scriptName } from './script-allowlist';

describe('isScript', () => {
  it('accepts the two script extensions and nothing else', () => {
    expect(isScript('Deep water.md')).toBe(true);
    expect(isScript('Deep water.TXT')).toBe(true);
    expect(isScript('cover.jpg')).toBe(false);
    expect(isScript('notes')).toBe(false);
  });
});

describe('scriptName', () => {
  it('is the filename without its extension', () => {
    expect(scriptName('Deep water.md')).toBe('Deep water');
  });
});
