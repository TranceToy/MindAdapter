import { createSpiralArms } from './spiral-source';
import type { SpiralPhase } from './spiral-schedule';

export type SpiralField = {
  element: HTMLElement;
  turn: (phase: SpiralPhase) => void;
  clear: () => void;
};

// The arms are built with the field and stay there for the session, hidden
// while nothing is turning: a stretch that declares no spiral costs a hidden
// element and no paint at all.
export function createSpiralField(): SpiralField {
  const arms = createSpiralArms();
  const element = document.createElement('div');
  element.className = 'spiral';
  element.hidden = true;
  element.append(arms.element);

  function turn(phase: SpiralPhase): void {
    element.hidden = false;
    element.style.opacity = String(phase.depth);
    arms.turn(phase.angle);
  }

  function clear(): void {
    element.hidden = true;
  }

  return { element, turn, clear };
}
