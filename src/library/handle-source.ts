import { readScripts } from '../script/read-scripts';
import type { AssetKind } from './asset-allowlist';
import type { LibrarySource } from './library-source';
import { walkSection } from './walk-library';

export function handleSource(root: FileSystemDirectoryHandle): LibrarySource {
  const pools = (section: string, kind: AssetKind) => walkSection(root, section, kind);
  const scripts = () => readScripts(root);
  return { pools, scripts };
}
