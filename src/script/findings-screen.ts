import { actionSecondary, dimHero, prose, surface } from '../shell/antechamber';
import type { Finding } from './finding';
import { BACK_LINE, findingLine } from './finding-copy';
import type { ScriptEntry } from './validate-script';

export type LeaveFindings = () => void;

export function renderFindings(script: ScriptEntry, leave: LeaveFindings): HTMLElement {
  const heading = dimHero(script.name);
  const report = renderReport(script.findings);
  const back = renderBack(leave);
  return surface([heading, report, back]);
}

function renderReport(findings: Finding[]): HTMLElement {
  const report = document.createElement('div');
  report.className = 'findings';
  for (const finding of findings) {
    const line = renderLine(finding);
    report.append(line);
  }
  return report;
}

function renderLine(finding: Finding): HTMLElement {
  const line = prose(findingLine(finding));
  line.classList.add('findings__line');
  return line;
}

function renderBack(leave: LeaveFindings): HTMLElement {
  const back = actionSecondary(BACK_LINE, leave);
  back.classList.add('findings__back');
  return back;
}
