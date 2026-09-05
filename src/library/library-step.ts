import { renderPlaceholder } from '../placeholder-screen';
import type { SurfaceHost } from '../shell/surface-host';
import { renderLibrary } from './library-screen';
import { chooseLibrary, reconnectLibrary, resolveLibrary } from './resolve-library';
import type { CurableResolution, LibraryResolution } from './resolve-library';
import { requestPersistentIndex } from './root-handle-store';
import { displayScanProgress } from './scan-progress';
import { scanLibrary } from './scan-library';

export async function runLibraryStep(host: SurfaceHost): Promise<void> {
  requestPersistentIndex();
  const resolution = await resolveLibrary();
  present(host, resolution);
}

function present(host: SurfaceHost, resolution: LibraryResolution): void {
  if (resolution.state === 'healthy') {
    void rescan(host, resolution.root);
    return;
  }
  const screen = renderLibrary(resolution.state, () => void cure(host, resolution));
  host.show(screen);
}

async function rescan(host: SurfaceHost, root: FileSystemDirectoryHandle): Promise<void> {
  const display = displayScanProgress(host);
  await scanLibrary(root, display.report);
  display.stop();
  const selection = renderPlaceholder('Selection');
  host.show(selection);
}

async function cure(host: SurfaceHost, resolution: CurableResolution): Promise<void> {
  const cured = await applyCure(resolution);
  present(host, cured);
}

function applyCure(resolution: CurableResolution): Promise<LibraryResolution> {
  if (resolution.state === 'grant-lost') return reconnectLibrary(resolution.root);
  return chooseLibrary();
}
