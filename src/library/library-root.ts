export const SCRIPTS_FOLDER = 'scripts';
export const IMAGES_FOLDER = 'images';
export const CLIPS_FOLDER = 'clips';

const SUBFOLDER_NAMES = [SCRIPTS_FOLDER, IMAGES_FOLDER, CLIPS_FOLDER];
const READWRITE: FileSystemPermissionMode = 'readwrite';

export async function pickLibraryRoot(): Promise<FileSystemDirectoryHandle | null> {
  if (!window.showDirectoryPicker) return null;
  const options: DirectoryPickerOptions = { mode: READWRITE };
  try {
    return await window.showDirectoryPicker(options);
  } catch (error) {
    if (isCancelled(error)) return null;
    throw error;
  }
}

// A handle without the permission calls is a handle the browser does not gate,
// so the grant it cannot be asked for is the grant it already has.
export function queryLibraryPermission(root: FileSystemDirectoryHandle): Promise<PermissionState> {
  if (!root.queryPermission) return Promise.resolve('granted');
  const descriptor: FileSystemHandlePermissionDescriptor = { mode: READWRITE };
  return root.queryPermission(descriptor);
}

export function requestLibraryPermission(
  root: FileSystemDirectoryHandle,
): Promise<PermissionState> {
  if (!root.requestPermission) return Promise.resolve('granted');
  const descriptor: FileSystemHandlePermissionDescriptor = { mode: READWRITE };
  return root.requestPermission(descriptor);
}

export async function scaffoldLibrary(root: FileSystemDirectoryHandle): Promise<boolean> {
  const options: FileSystemGetDirectoryOptions = { create: true };
  try {
    for (const name of SUBFOLDER_NAMES) {
      await root.getDirectoryHandle(name, options);
    }
    return true;
  } catch (error) {
    if (isGone(error)) return false;
    // A folder the app may not create is a folder the scan finds empty, which
    // costs the layer that wanted it and not the library.
    return true;
  }
}

function isCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function isGone(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotFoundError';
}
