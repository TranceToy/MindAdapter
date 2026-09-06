import { SPIRALS_HIGH } from '../script/declaration-values';
import { createSpiralArms } from './spiral-source';
import type { SpiralArms } from './spiral-source';
import type { SpiralPhase } from './spiral-schedule';

export type SpiralField = {
  element: HTMLElement;
  turn: (phases: SpiralPhase[]) => void;
  clear: () => void;
};

// One arm set for every spiral a session may turn, all of them built with the
// field and kept there: a stretch that turns fewer than it might, or none at
// all, costs a hidden element and no paint at all.
export function createSpiralField(): SpiralField {
  const sets = armSets();
  const element = document.createElement('div');
  element.className = 'spiral';
  element.hidden = true;
  for (const set of sets) element.append(set.element);

  function turn(phases: SpiralPhase[]): void {
    element.hidden = false;
    sets.forEach((set, place) => stand(set, phases[place]));
  }

  function clear(): void {
    element.hidden = true;
  }

  return { element, turn, clear };
}

function armSets(): SpiralArms[] {
  const sets: SpiralArms[] = [];
  for (let place = 0; place < SPIRALS_HIGH; place += 1) sets.push(createSpiralArms());
  return sets;
}

// The depth belongs to the spiral rather than to the layer now that two of them
// may turn at once, so the opacity rides the arms and not the box they share.
function stand(set: SpiralArms, phase: SpiralPhase | undefined): void {
  set.element.toggleAttribute('hidden', !phase);
  if (!phase) return;
  set.element.style.opacity = String(phase.depth);
  set.turn(phase.angle);
}
