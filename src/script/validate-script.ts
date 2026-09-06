import { assetFindings } from './asset-findings';
import type { Inventory } from './asset-findings';
import type { Finding } from './finding';
import { formatFindings } from './format-findings';
import { parseScript } from './parse-script';
import { resolveSegments } from './resolve-script';
import type { Segment } from './resolve-script';

export type ScriptFile = {
  name: string;
  text: string;
};

export type ScriptEntry = {
  name: string;
  segments: Segment[];
  findings: Finding[];
};

export function validateScripts(files: ScriptFile[], inventory: Inventory): ScriptEntry[] {
  const entries: ScriptEntry[] = [];
  for (const file of files) {
    const entry = validateScript(file, inventory);
    entries.push(entry);
  }
  return entries.sort(byName);
}

export function validateScript(file: ScriptFile, inventory: Inventory): ScriptEntry {
  const parsed = parseScript(file.text);
  const format = formatFindings(parsed);
  if (format.length > 0) return unplayable(file.name, format);
  const assets = assetFindings(parsed, inventory);
  if (assets.length > 0) return unplayable(file.name, assets);
  const segments = resolveSegments(parsed);
  return { name: file.name, segments, findings: [] };
}

export function isPlayable(entry: ScriptEntry): boolean {
  return entry.findings.length === 0;
}

function unplayable(name: string, findings: Finding[]): ScriptEntry {
  return { name, segments: [], findings };
}

function byName(left: ScriptEntry, right: ScriptEntry): number {
  return left.name.localeCompare(right.name);
}
