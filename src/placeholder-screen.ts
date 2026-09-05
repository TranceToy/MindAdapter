import { dimHero, secondary, surface } from './shell/antechamber';

export function renderPlaceholder(name: string): HTMLElement {
  const heading = dimHero(name);
  const note = secondary('not built yet');
  return surface([heading, note]);
}
