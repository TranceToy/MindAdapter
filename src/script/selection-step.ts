import type { Library } from '../library/scan-library';
import { renderPlaceholder } from '../placeholder-screen';
import type { SurfaceHost } from '../shell/surface-host';
import { renderSelection } from './selection-screen';
import type { RelinkLibrary } from './selection-screen';
import type { ScriptEntry } from './validate-script';

export function showSelection(host: SurfaceHost, library: Library, relink: RelinkLibrary): void {
  const start = (script: ScriptEntry) => showStart(host, script);
  const screen = renderSelection(library.scripts, start, relink);
  host.show(screen);
}

function showStart(host: SurfaceHost, script: ScriptEntry): void {
  const screen = renderPlaceholder(script.name);
  host.show(screen);
}
