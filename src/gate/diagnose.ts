export type Capabilities = {
  audio: boolean;
  directoryPicker: boolean;
  directoryInput: boolean;
};

export type Diagnosis = 'no-audio' | 'no-directory-read';

// The gate refuses only what no fallback covers. A missing picker leaves the
// folder input, a missing install leaves a tab, a missing wake lock leaves a
// dimming screen — those are degradations the app carries, not preconditions.
export function diagnose(capabilities: Capabilities): Diagnosis | null {
  if (!capabilities.audio) return 'no-audio';
  if (!capabilities.directoryPicker && !capabilities.directoryInput) return 'no-directory-read';
  return null;
}
