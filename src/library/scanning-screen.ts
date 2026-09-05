import { hero, secondary, surface } from '../shell/antechamber';
import { SCANNING_LINE } from './library-copy';
import type { ScanProgress } from './scan-library';

export type ScanningScreen = {
  element: HTMLElement;
  update: (progress: ScanProgress) => void;
};

export function renderScanning(progress: ScanProgress): ScanningScreen {
  const count = hero(countText(progress));
  const note = secondary(SCANNING_LINE);
  const element = surface([count, note]);

  function update(next: ScanProgress): void {
    count.textContent = countText(next);
  }

  return { element, update };
}

function countText(progress: ScanProgress): string {
  return `${progress.measured} / ${progress.total}`;
}
