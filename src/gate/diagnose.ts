export type Capabilities = {
  fileAccess: boolean;
  installed: boolean;
};

export type Diagnosis = 'unsupported-browser' | 'no-file-access' | 'not-installed';

export function diagnose(capabilities: Capabilities): Diagnosis | null {
  if (!capabilities.fileAccess && !capabilities.installed) return 'unsupported-browser';
  if (!capabilities.fileAccess) return 'no-file-access';
  if (!capabilities.installed) return 'not-installed';
  return null;
}
