import type { Diagnosis } from './diagnose';

type GateCopy = {
  hero: string;
  cure: string;
  reopen: boolean;
};

export const GATE_COPY: Record<Diagnosis, GateCopy> = {
  'unsupported-browser': {
    hero: 'This browser cannot run the app',
    cure:
      'Chromium engines only, and only as an installed app. Firefox and Safari are refused, '
      + 'not degraded — there is no version of this app for them.',
    reopen: false,
  },
  'no-file-access': {
    hero: 'No file access',
    cure:
      'Brave removes this API by default: set brave://flags/#file-system-access-api to Enabled '
      + 'and relaunch. On another engine (Firefox, Safari) the app cannot run at all.',
    reopen: true,
  },
  'not-installed': {
    hero: 'Not installed',
    cure:
      'Install the app from the address bar, then open it from the installed window. '
      + 'This tab cannot run a session.',
    reopen: true,
  },
};

export const REOPEN_LINE = 'reopen the app when it is fixed';
