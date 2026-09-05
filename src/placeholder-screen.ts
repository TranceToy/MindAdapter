import { dimHero, secondary, surface } from './shell/antechamber';

export function renderPlaceholder(): HTMLElement {
  const parts = [dimHero('Library'), secondary('not built yet')];
  return surface(parts);
}
