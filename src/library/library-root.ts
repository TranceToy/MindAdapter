const SUBFOLDER_NAMES = ['scripts', 'images', 'clips'];
const READWRITE: FileSystemPermissionMode = 'readwrite';

export async function pickLibraryRoot(): Promise<FileSystemDirectoryHandle | null> {
  const options: DirectoryPickerOptions = { mode: READWRITE };
  try {
    return await window.showDirectoryPicker(options);
  } catch (error) {
    if (isCancelled(error)) return null;
    throw error;
  }
}

export function queryLibraryPermission(root: FileSystemDirectoryHandle): Promise<PermissionState> {
  const descriptor: FileSystemHandlePermissionDescriptor = { mode: READWRITE };
  return root.queryPermission(descriptor);
}

export function requestLibraryPermission(root: FileSystemDirectoryHandle): Promise<PermissionState> {
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
    throw error;
  }
}

function isCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function isGone(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotFoundError';
}
