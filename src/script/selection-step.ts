import type { Library } from '../library/scan-library';
import { showStart } from '../session/session-step';
import type { SurfaceHost } from '../shell/surface-host';
import { renderFindings } from './findings-screen';
import { renderSelection } from './selection-screen';
import type { RelinkLibrary } from './selection-screen';
import type { ScriptEntry } from './validate-script';

export function showSelection(host: SurfaceHost, library: Library, relink: RelinkLibrary): void {
  const back = () => showSelection(host, library, relink);
  const start = (script: ScriptEntry) => showStart(host, script, back);
  const open = (script: ScriptEntry) => showFindings(host, library, relink, script);
  const screen = renderSelection(library.scripts, start, open, relink);
  host.show(screen);
}

function showFindings(
  host: SurfaceHost,
  library: Library,
  relink: RelinkLibrary,
  script: ScriptEntry,
): void {
  const leave = () => showSelection(host, library, relink);
  const screen = renderFindings(script, leave);
  host.show(screen);
}
