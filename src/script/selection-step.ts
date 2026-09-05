import type { Library } from '../library/scan-library';
import { renderPlaceholder } from '../placeholder-screen';
import type { SurfaceHost } from '../shell/surface-host';
import { renderFindings } from './findings-screen';
import { renderSelection } from './selection-screen';
import type { RelinkLibrary } from './selection-screen';
import type { ScriptEntry } from './validate-script';

export function showSelection(host: SurfaceHost, library: Library, relink: RelinkLibrary): void {
  const start = (script: ScriptEntry) => showStart(host, script);
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

function showStart(host: SurfaceHost, script: ScriptEntry): void {
  const screen = renderPlaceholder(script.name);
  host.show(screen);
}
