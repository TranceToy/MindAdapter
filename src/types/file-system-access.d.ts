type FileSystemPermissionMode = 'read' | 'readwrite';

interface FileSystemHandlePermissionDescriptor {
  mode?: FileSystemPermissionMode;
}

interface DirectoryPickerOptions {
  id?: string;
  mode?: FileSystemPermissionMode;
  startIn?: FileSystemHandle | string;
}

// Optional throughout: the app runs on browsers that have none of this, so
// every call site has to ask before it reaches for one.
interface FileSystemHandle {
  queryPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  requestPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface Window {
  showDirectoryPicker?(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
}
