import type { AssetKind } from './asset-allowlist';
import type { ScriptFile } from '../script/validate-script';
import type { Pool } from './walk-library';

// What a file is, to everything that reads one. The picker hands out handles
// and the folder input hands out files; both answer this and nothing else.
export type FileSource = {
  getFile: () => Promise<File>;
};

// Where a library's bytes come from. Handles outlive a launch and files do not,
// which is the whole of the difference — no layer downstream of the scan can
// tell which source it was given.
export type LibrarySource = {
  pools: (section: string, kind: AssetKind) => Promise<Pool[]>;
  scripts: () => Promise<ScriptFile[]>;
};
