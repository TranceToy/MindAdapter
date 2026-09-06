import { hasDirectoryPicker } from '../shell/platform';
import { filesSource, libraryFiles } from './files-source';
import { holdsLibrary } from './group-files';
import { handleSource } from './handle-source';
import type { LibrarySource } from './library-source';
import {
  pickLibraryRoot,
  queryLibraryPermission,
  requestLibraryPermission,
  scaffoldLibrary,
} from './library-root';
import { pickLibraryFiles } from './pick-folder';
import { loadRootHandle, saveRootHandle } from './root-handle-store';

export type LibraryResolution =
  | { state: 'no-library' }
  | { state: 'pick-again' }
  | { state: 'grant-lost'; root: FileSystemDirectoryHandle }
  | { state: 'root-missing' }
  | { state: 'no-content' }
  | { state: 'healthy'; source: LibrarySource };

export type CurableResolution = Exclude<LibraryResolution, { state: 'healthy' }>;

export type CurableState = CurableResolution['state'];

// Without the picker there is no handle to keep, so every launch starts at the
// folder and the index carries what it can — the measurements, not the folder.
export async function resolveLibrary(): Promise<LibraryResolution> {
  if (!hasDirectoryPicker()) return { state: 'pick-again' };
  const root = await loadRootHandle();
  if (!root) return { state: 'no-library' };
  const permission = await queryLibraryPermission(root);
  if (permission !== 'granted') return { state: 'grant-lost', root };
  return openLibrary(root);
}

export async function chooseLibrary(): Promise<LibraryResolution> {
  if (!hasDirectoryPicker()) return chooseFolder();
  const picked = await pickLibraryRoot();
  if (!picked) return resolveLibrary();
  await saveRootHandle(picked);
  return openLibrary(picked);
}

export async function reconnectLibrary(
  root: FileSystemDirectoryHandle,
): Promise<LibraryResolution> {
  const permission = await requestLibraryPermission(root);
  if (permission !== 'granted') return { state: 'grant-lost', root };
  return openLibrary(root);
}

// The state a scan fails in: the folder the app was reading is not there to be
// read, and where it goes back to depends on what it can pick.
export function lostLibrary(): CurableResolution {
  if (!hasDirectoryPicker()) return { state: 'pick-again' };
  return { state: 'root-missing' };
}

async function openLibrary(root: FileSystemDirectoryHandle): Promise<LibraryResolution> {
  const reachable = await scaffoldLibrary(root);
  if (!reachable) return { state: 'root-missing' };
  return { state: 'healthy', source: handleSource(root) };
}

async function chooseFolder(): Promise<LibraryResolution> {
  const picked = await pickLibraryFiles();
  if (!picked) return { state: 'pick-again' };
  const files = libraryFiles(picked);
  if (!holdsLibrary(files)) return { state: 'no-content' };
  return { state: 'healthy', source: filesSource(files) };
}
