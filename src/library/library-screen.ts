import { actionHero, prose, surface } from '../shell/antechamber';
import { installNudge } from '../shell/install-nudge';
import { LIBRARY_COPY } from './library-copy';
import type { CurableState } from './resolve-library';

export function renderLibrary(state: CurableState, cure: () => void): HTMLElement {
  const copy = LIBRARY_COPY[state];
  const action = actionHero(copy.hero, cure);
  const explanation = prose(copy.cure);
  const parts = [action, explanation];
  const nudge = installNudge();
  if (nudge) parts.push(nudge);
  return surface(parts);
}
