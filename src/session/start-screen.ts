import { durationText } from '../script/session-duration';
import type { ScriptEntry } from '../script/validate-script';
import { actionHero, dimActionHero, prose, secondary, surface } from '../shell/antechamber';
import { START_LINE } from './session-copy';

export type BeginSession = () => void;

export type LeaveStart = () => void;

export type StartScreen = {
  element: HTMLElement;
  fail: (line: string) => void;
};

export function renderStart(
  script: ScriptEntry,
  begin: BeginSession,
  leave: LeaveStart,
): StartScreen {
  const name = dimActionHero(script.name, leave);
  const duration = secondary(durationText(script.segments));
  const start = renderBegin(begin);
  const failure = renderFailure();
  const element = surface([name, duration, start, failure]);

  function fail(line: string): void {
    failure.textContent = line;
  }

  return { element, fail };
}

function renderBegin(begin: BeginSession): HTMLElement {
  const button = actionHero(START_LINE, begin);
  button.classList.add('start__begin');
  return button;
}

function renderFailure(): HTMLElement {
  const line = prose('');
  line.classList.add('start__failure');
  return line;
}
