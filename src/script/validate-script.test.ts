import { describe, expect, it } from 'vitest';
import type { Inventory } from './asset-findings';
import { isPlayable, validateScript, validateScripts } from './validate-script';
import type { ScriptFile } from './validate-script';

const INVENTORY: Inventory = {
  images: new Map([['ocean', 12]]),
  clips: new Map([['obedience', 4]]),
};

const CLEAN = '# ocean\nvoice: obedience\n\nThe water is warm and heavy.\n';

describe('validateScript', () => {
  it('reports a playable script with its resolved segments', () => {
    const file: ScriptFile = { name: 'Deep water', text: CLEAN };
    const entry = validateScript(file, INVENTORY);
    expect(isPlayable(entry)).toBe(true);
    expect(entry.segments).toHaveLength(1);
    expect(entry.segments[0]?.words).toHaveLength(6);
  });

  it('suppresses asset findings while the format is broken', () => {
    const file: ScriptFile = { name: 'Broken', text: 'bed: 150\n\n# ocaen\n\nOnly this.\n' };
    const entry = validateScript(file, INVENTORY);
    expect(entry.findings).toHaveLength(1);
    expect(entry.findings[0]?.locus).toEqual({ kind: 'file', line: 1 });
  });

  it('checks assets once the format is clean', () => {
    const file: ScriptFile = { name: 'Misspelt', text: '# ocaen\n\nOnly this.\n' };
    const entry = validateScript(file, INVENTORY);
    expect(isPlayable(entry)).toBe(false);
    expect(entry.findings[0]?.locus).toEqual({ kind: 'library', path: 'images/ocaen/' });
  });
});

describe('validateScripts', () => {
  it('sorts entries alphabetically by name, playable or not', () => {
    const files: ScriptFile[] = [
      { name: 'Void', text: CLEAN },
      { name: 'Anchor', text: 'bed: 150\n' },
      { name: 'Deep water', text: CLEAN },
    ];
    const entries = validateScripts(files, INVENTORY);
    const names = entries.map((entry) => entry.name);
    expect(names).toEqual(['Anchor', 'Deep water', 'Void']);
    expect(entries.map(isPlayable)).toEqual([false, true, true]);
  });
});
