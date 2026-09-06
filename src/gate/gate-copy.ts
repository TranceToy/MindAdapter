import type { Diagnosis } from './diagnose';

type GateCopy = {
  hero: string;
  cure: string;
  reopen: boolean;
};

export const GATE_COPY: Record<Diagnosis, GateCopy> = {
  'no-audio': {
    hero: 'No audio',
    cure:
      'This browser has no Web Audio. All four layers are timed against it and the bed is '
      + 'generated in it, so there is nothing here that can run without it.',
    reopen: false,
  },
  'no-directory-read': {
    hero: 'No folder access',
    cure:
      'The library is a folder on your disk, and this browser can open one neither by picker '
      + 'nor by folder upload. A current Chromium, Firefox or Safari can.',
    reopen: true,
  },
};

export const REOPEN_LINE = 'reopen the app when it is fixed';
