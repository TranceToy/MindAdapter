import type { Capabilities } from './diagnose';

export function detectCapabilities(): Capabilities {
  return {
    fileAccess: typeof window.showDirectoryPicker === 'function',
    installed: matchMedia('(display-mode: standalone)').matches,
  };
}
