import { renderPlaceholder } from '../placeholder-screen';
import type { SurfaceHost } from '../shell/surface-host';
import { renderLibrary } from './library-screen';
import { chooseLibrary, reconnectLibrary, resolveLibrary } from './resolve-library';
import type { CurableResolution, LibraryResolution } from './resolve-library';
import { requestPersistentIndex } from './root-handle-store';

export async function runLibraryStep(host: SurfaceHost): Promise<void> {
  requestPersistentIndex();
  const resolution = await resolveLibrary();
  present(host, resolution);
}

function present(host: SurfaceHost, resolution: LibraryResolution): void {
  if (resolution.state === 'healthy') {
    const scanning = renderPlaceholder('Scanning');
    host.show(scanning);
    return;
  }
  const screen = renderLibrary(resolution.state, () => void cure(host, resolution));
  host.show(screen);
}

async function cure(host: SurfaceHost, resolution: CurableResolution): Promise<void> {
  const cured = await applyCure(resolution);
  present(host, cured);
}

function applyCure(resolution: CurableResolution): Promise<LibraryResolution> {
  if (resolution.state === 'grant-lost') return reconnectLibrary(resolution.root);
  return chooseLibrary();
}
