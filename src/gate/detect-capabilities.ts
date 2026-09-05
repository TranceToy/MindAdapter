import type { Capabilities } from './diagnose';

export function detectCapabilities(): Capabilities {
  const directoryPicker = (window as { showDirectoryPicker?: unknown }).showDirectoryPicker;
  return {
    fileAccess: typeof directoryPicker === 'function',
    installed: matchMedia('(display-mode: standalone)').matches,
  };
}
