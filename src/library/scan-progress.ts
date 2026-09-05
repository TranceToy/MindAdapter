import type { SurfaceHost } from '../shell/surface-host';
import { renderScanning } from './scanning-screen';
import type { ScanningScreen } from './scanning-screen';
import type { ScanProgress } from './scan-library';

const SUPPRESSION_MS = 400;

export type ProgressDisplay = {
  report: (progress: ScanProgress) => void;
  stop: () => void;
};

export function displayScanProgress(host: SurfaceHost): ProgressDisplay {
  let latest: ScanProgress | null = null;
  let screen: ScanningScreen | null = null;
  let suppressed = true;
  const timer = setTimeout(reveal, SUPPRESSION_MS);

  function reveal(): void {
    suppressed = false;
    if (!latest || screen) return;
    screen = renderScanning(latest);
    host.show(screen.element);
  }

  function report(progress: ScanProgress): void {
    latest = progress;
    if (screen) screen.update(progress);
    else if (!suppressed) reveal();
  }

  function stop(): void {
    clearTimeout(timer);
  }

  return { report, stop };
}
