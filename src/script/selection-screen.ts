import { RELINK_LINE } from '../library/library-copy';
import { actionSecondary, secondary, surface } from '../shell/antechamber';
import { problemsLine } from './finding-copy';
import { durationLabel, sessionSeconds } from './session-duration';
import { isPlayable } from './validate-script';
import type { ScriptEntry } from './validate-script';

export type StartScript = (script: ScriptEntry) => void;

export type RelinkLibrary = () => void;

export function renderSelection(
  scripts: ScriptEntry[],
  start: StartScript,
  relink: RelinkLibrary,
): HTMLElement {
  const list = document.createElement('ul');
  list.className = 'list';
  for (const script of scripts) {
    const row = renderRow(script, start);
    list.append(row);
  }
  const library = renderRelink(relink);
  return surface([list, library]);
}

function renderRelink(relink: RelinkLibrary): HTMLElement {
  const line = actionSecondary(RELINK_LINE, relink);
  line.classList.add('selection__library');
  return line;
}

function renderRow(script: ScriptEntry, start: StartScript): HTMLElement {
  const row = document.createElement('li');
  row.className = 'list__row';
  const name = renderName(script, start);
  const meta = renderMeta(script);
  row.append(name, meta);
  return row;
}

function renderName(script: ScriptEntry, start: StartScript): HTMLElement {
  if (!isPlayable(script)) return dimName(script.name);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'list__name';
  button.textContent = script.name;
  button.addEventListener('click', () => start(script));
  return button;
}

function dimName(name: string): HTMLElement {
  const label = document.createElement('div');
  label.className = 'list__name list__name--dim';
  label.textContent = name;
  return label;
}

function renderMeta(script: ScriptEntry): HTMLElement {
  const text = isPlayable(script) ? durationText(script.words) : problemCount(script);
  const meta = secondary(text);
  meta.classList.add('list__meta');
  return meta;
}

function problemCount(script: ScriptEntry): string {
  return problemsLine(script.findings.length);
}

function durationText(words: number): string {
  const seconds = sessionSeconds(words);
  return durationLabel(seconds);
}
