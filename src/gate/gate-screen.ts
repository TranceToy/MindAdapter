import { dimHero, prose, secondary, surface } from '../shell/antechamber';
import type { Diagnosis } from './diagnose';
import { GATE_COPY, REOPEN_LINE } from './gate-copy';

export function renderGate(diagnosis: Diagnosis): HTMLElement {
  const copy = GATE_COPY[diagnosis];
  const parts = [dimHero(copy.hero), prose(copy.cure)];
  if (copy.reopen) {
    const reopen = secondary(REOPEN_LINE);
    parts.push(reopen);
  }
  return surface(parts);
}
