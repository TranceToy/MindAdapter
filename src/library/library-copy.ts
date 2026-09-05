import type { CurableState } from './resolve-library';

type LibraryCopy = {
  hero: string;
  cure: string;
};

export const SCANNING_LINE = 'measuring clips';
export const RELINK_LINE = 'library';

export const LIBRARY_COPY: Record<CurableState, LibraryCopy> = {
  'no-library': {
    hero: 'Choose folder',
    cure:
      'One folder on your disk holds everything a session plays. Pick it and the app creates '
      + 'scripts, images and clips inside it where they are missing. Nothing is copied, moved '
      + 'or renamed.',
  },
  'grant-lost': {
    hero: 'Reconnect',
    cure: 'The library folder is still known, but this window has lost access to it.',
  },
  'root-missing': {
    hero: 'Choose folder',
    cure:
      'The library folder is no longer where it was — moved, renamed or deleted. Pick it at its '
      + 'new place, or pick another folder.',
  },
};
