import { durationText } from '../script/session-duration';
import type { ScriptEntry } from '../script/validate-script';
import { actionHero, dimActionHero, prose, secondary, surface } from '../shell/antechamber';
import { hasFullscreen } from '../shell/platform';
import { probeMono } from './output-check';
import { MONO_OUTPUT_WARNING, START_LINE, WINDOWED_SESSION } from './session-copy';

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
  const parts = [name, duration, start, failure];
  const windowed = renderWindowed();
  if (windowed) parts.push(windowed);
  const mono = renderMono();
  if (mono) parts.push(mono);
  const element = surface(parts);

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

// Said before the Start, because it changes what the session will be and how
// it is left, and it is known without trying.
function renderWindowed(): HTMLElement | null {
  if (hasFullscreen()) return null;
  return prose(WINDOWED_SESSION);
}

// Said here for the same reason: it changes what the session will be — three
// layers instead of four — and it is known before the Start rather than only
// once something interrupts one.
function renderMono(): HTMLElement | null {
  if (!probeMono()) return null;
  return prose(MONO_OUTPUT_WARNING);
}

function renderFailure(): HTMLElement {
  const line = prose('');
  line.classList.add('start__failure');
  return line;
}
