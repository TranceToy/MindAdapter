import { actionHero, prose, surface } from '../shell/antechamber';
import { LIBRARY_COPY } from './library-copy';
import type { CurableState } from './resolve-library';

export function renderLibrary(state: CurableState, cure: () => void): HTMLElement {
  const copy = LIBRARY_COPY[state];
  const action = actionHero(copy.hero, cure);
  const explanation = prose(copy.cure);
  return surface([action, explanation]);
}
