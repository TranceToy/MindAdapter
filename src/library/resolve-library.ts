import {
  pickLibraryRoot,
  queryLibraryPermission,
  requestLibraryPermission,
  scaffoldLibrary,
} from './library-root';
import { loadRootHandle, saveRootHandle } from './root-handle-store';

export type LibraryResolution =
  | { state: 'no-library' }
  | { state: 'grant-lost'; root: FileSystemDirectoryHandle }
  | { state: 'root-missing' }
  | { state: 'healthy'; root: FileSystemDirectoryHandle };

export type CurableResolution = Exclude<LibraryResolution, { state: 'healthy' }>;

export type CurableState = CurableResolution['state'];

export async function resolveLibrary(): Promise<LibraryResolution> {
  const root = await loadRootHandle();
  if (!root) return { state: 'no-library' };
  const permission = await queryLibraryPermission(root);
  if (permission !== 'granted') return { state: 'grant-lost', root };
  return openLibrary(root);
}

export async function chooseLibrary(): Promise<LibraryResolution> {
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

async function openLibrary(root: FileSystemDirectoryHandle): Promise<LibraryResolution> {
  const reachable = await scaffoldLibrary(root);
  if (!reachable) return { state: 'root-missing' };
  return { state: 'healthy', root };
}
