import { hasAudio, hasDirectoryInput, hasDirectoryPicker } from '../shell/platform';
import type { Capabilities } from './diagnose';

export function detectCapabilities(): Capabilities {
  return {
    audio: hasAudio(),
    directoryPicker: hasDirectoryPicker(),
    directoryInput: hasDirectoryInput(),
  };
}
