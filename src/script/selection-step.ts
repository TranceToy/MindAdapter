import type { Calibration } from '../calibration/calibration';
import { showCalibration } from '../calibration/calibration-step';
import type { Library } from '../library/scan-library';
import { showStart } from '../session/session-step';
import type { SurfaceHost } from '../shell/surface-host';
import { renderFindings } from './findings-screen';
import { renderSelection } from './selection-screen';
import type { RelinkLibrary, SelectionActions } from './selection-screen';
import type { ScriptEntry } from './validate-script';

export function showSelection(
  host: SurfaceHost,
  library: Library,
  calibration: Calibration,
  relink: RelinkLibrary,
): void {
  const back = () => showSelection(host, library, calibration, relink);
  const start = (script: ScriptEntry) => showStart(host, script, library, calibration, back);
  const open = (script: ScriptEntry) => showFindings(host, library, calibration, relink, script);
  const calibrate = () => reachCalibration(host, library, calibration, relink);
  const actions: SelectionActions = { start, open, calibrate, relink };
  const screen = renderSelection(library.scripts, actions);
  host.show(screen);
}

// Calibration reached from here returns here, with whatever it was left at: the
// screen has one control and where it goes follows from how it was reached.
function reachCalibration(
  host: SurfaceHost,
  library: Library,
  calibration: Calibration,
  relink: RelinkLibrary,
): void {
  const done = (set: Calibration) => showSelection(host, library, set, relink);
  showCalibration(host, library.clips, calibration, done);
}

function showFindings(
  host: SurfaceHost,
  library: Library,
  calibration: Calibration,
  relink: RelinkLibrary,
  script: ScriptEntry,
): void {
  const leave = () => showSelection(host, library, calibration, relink);
  const screen = renderFindings(script, leave);
  host.show(screen);
}
