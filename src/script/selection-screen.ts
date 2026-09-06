import { CALIBRATION_LINE } from '../calibration/calibration-copy';
import { RELINK_LINE } from '../library/library-copy';
import { actionSecondary, secondary, surface } from '../shell/antechamber';
import { installNudge } from '../shell/install-nudge';
import { problemsLine } from './finding-copy';
import { durationText } from './session-duration';
import { isPlayable } from './validate-script';
import type { ScriptEntry } from './validate-script';

export type StartScript = (script: ScriptEntry) => void;

export type OpenFindings = (script: ScriptEntry) => void;

export type RelinkLibrary = () => void;

export type ReachCalibration = () => void;

export type SelectionActions = {
  start: StartScript;
  open: OpenFindings;
  calibrate: ReachCalibration;
  relink: RelinkLibrary;
};

export function renderSelection(scripts: ScriptEntry[], actions: SelectionActions): HTMLElement {
  const list = document.createElement('ul');
  list.className = 'list';
  for (const script of scripts) {
    const row = renderRow(script, actions.start, actions.open);
    list.append(row);
  }
  const calibration = renderAside(CALIBRATION_LINE, actions.calibrate);
  const library = renderAside(RELINK_LINE, actions.relink);
  const parts = [list, calibration, library];
  const nudge = installNudge();
  if (nudge) parts.push(nudge);
  return surface(parts);
}

function renderAside(text: string, reach: () => void): HTMLElement {
  const line = actionSecondary(text, reach);
  line.classList.add('selection__aside');
  return line;
}

function renderRow(script: ScriptEntry, start: StartScript, open: OpenFindings): HTMLElement {
  const row = document.createElement('li');
  row.className = 'list__row';
  const name = renderName(script, start, open);
  const meta = renderMeta(script);
  row.append(name, meta);
  return row;
}

function renderName(script: ScriptEntry, start: StartScript, open: OpenFindings): HTMLElement {
  if (!isPlayable(script)) return dimName(script, open);
  const button = nameButton(script.name);
  button.addEventListener('click', () => start(script));
  return button;
}

function dimName(script: ScriptEntry, open: OpenFindings): HTMLElement {
  const button = nameButton(script.name);
  button.classList.add('list__name--dim');
  button.addEventListener('click', () => open(script));
  return button;
}

function nameButton(name: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'list__name';
  button.textContent = name;
  return button;
}

function renderMeta(script: ScriptEntry): HTMLElement {
  const text = isPlayable(script) ? durationText(script.segments) : problemCount(script);
  const meta = secondary(text);
  meta.classList.add('list__meta');
  return meta;
}

function problemCount(script: ScriptEntry): string {
  return problemsLine(script.findings.length);
}
