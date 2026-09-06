import { FULL_CALIBRATION } from '../calibration/calibration';
import type { Calibration } from '../calibration/calibration';
import { showCalibration } from '../calibration/calibration-step';
import { loadCalibration } from '../calibration/calibration-store';
import { showSelection } from '../script/selection-step';
import type { SurfaceHost } from '../shell/surface-host';
import { renderLibrary } from './library-screen';
import { chooseLibrary, lostLibrary, reconnectLibrary, resolveLibrary } from './resolve-library';
import type { CurableResolution, LibraryResolution } from './resolve-library';
import type { LibrarySource } from './library-source';
import { requestPersistentIndex } from './root-handle-store';
import { displayScanProgress } from './scan-progress';
import { scanLibrary } from './scan-library';
import type { Library, ReportProgress } from './scan-library';

export async function runLibraryStep(host: SurfaceHost): Promise<void> {
  requestPersistentIndex();
  const resolution = await resolveLibrary();
  present(host, resolution);
}

function present(host: SurfaceHost, resolution: LibraryResolution): void {
  if (resolution.state === 'healthy') {
    void rescan(host, resolution.source);
    return;
  }
  const screen = renderLibrary(resolution.state, () => void cure(host, resolution));
  host.show(screen);
}

async function rescan(host: SurfaceHost, source: LibrarySource): Promise<void> {
  const display = displayScanProgress(host);
  const library = await scan(source, display.report);
  display.stop();
  if (!library) {
    present(host, lostLibrary());
    return;
  }
  const calibration = await loadCalibration();
  presentLibrary(host, library, calibration);
}

// A library that goes mid-scan is a library to pick again, not a failed launch.
async function scan(source: LibrarySource, report: ReportProgress): Promise<Library | null> {
  try {
    return await scanLibrary(source, report);
  } catch {
    return null;
  }
}

// Levels the index has never held are levels the user has never set, so first
// run and a cleared index reach the same step and there is no recovery case of
// its own.
function presentLibrary(
  host: SurfaceHost,
  library: Library,
  calibration: Calibration | null,
): void {
  const relinkLibrary = () => void relink(host);
  if (calibration) {
    showSelection(host, library, calibration, relinkLibrary);
    return;
  }
  const done = (set: Calibration) => showSelection(host, library, set, relinkLibrary);
  showCalibration(host, library.clips, FULL_CALIBRATION, done);
}

async function relink(host: SurfaceHost): Promise<void> {
  const resolution = await chooseLibrary();
  present(host, resolution);
}

async function cure(host: SurfaceHost, resolution: CurableResolution): Promise<void> {
  const cured = await applyCure(resolution);
  present(host, cured);
}

function applyCure(resolution: CurableResolution): Promise<LibraryResolution> {
  if (resolution.state === 'grant-lost') return reconnectLibrary(resolution.root);
  return chooseLibrary();
}
