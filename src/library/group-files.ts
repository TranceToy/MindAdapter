import { isScript } from '../script/script-allowlist';
import { isAsset } from './asset-allowlist';
import type { AssetKind } from './asset-allowlist';
import { CLIPS_FOLDER, IMAGES_FOLDER, SCRIPTS_FOLDER } from './library-root';
import type { LibraryFile, Pool } from './walk-library';

const SECTIONS = [SCRIPTS_FOLDER, IMAGES_FOLDER, CLIPS_FOLDER];
const POOL_DEPTH = 3;
const SCRIPT_DEPTH = 2;

// The folder input hands back one flat list, every path prefixed with the name
// of the folder that was picked. Dropping that prefix leaves exactly the paths
// the walk builds, so an index measured under one source is read under the
// other and a browser swap costs no measurement.
export function libraryPath(relativePath: string): string {
  const cut = relativePath.indexOf('/');
  if (cut < 0) return relativePath;
  return relativePath.slice(cut + 1);
}

export function poolsUnder(files: LibraryFile[], section: string, kind: AssetKind): Pool[] {
  const held = new Map<string, LibraryFile[]>();
  for (const file of files) {
    const tag = poolTag(file.path, section);
    if (!tag) continue;
    if (!isAsset(fileName(file.path), kind)) continue;
    collect(held, tag, file);
  }
  return pools(held);
}

// Only the direct children of the section, which is what the walk reads: a
// script in a subfolder is not listed there either.
export function scriptFilesUnder(files: LibraryFile[]): LibraryFile[] {
  const found: LibraryFile[] = [];
  for (const file of files) {
    const parts = file.path.split('/');
    if (parts.length !== SCRIPT_DEPTH) continue;
    if (parts[0] !== SCRIPTS_FOLDER) continue;
    const name = parts[1] ?? '';
    if (!isScript(name)) continue;
    found.push(file);
  }
  return found;
}

// Nothing under any of the three names is a folder that was never a library —
// and with no picker the app cannot create the folders to make it one.
export function holdsLibrary(files: LibraryFile[]): boolean {
  return files.some((file) => SECTIONS.includes(sectionOf(file.path)));
}

function sectionOf(path: string): string {
  const [section] = path.split('/');
  return section ?? path;
}

function poolTag(path: string, section: string): string | null {
  const parts = path.split('/');
  if (parts.length < POOL_DEPTH) return null;
  if (parts[0] !== section) return null;
  return parts[1] ?? null;
}

export function fileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] ?? path;
}

function collect(held: Map<string, LibraryFile[]>, tag: string, file: LibraryFile): void {
  const pooled = held.get(tag);
  if (pooled) {
    pooled.push(file);
    return;
  }
  held.set(tag, [file]);
}

function pools(held: Map<string, LibraryFile[]>): Pool[] {
  const built: Pool[] = [];
  for (const [tag, files] of held) built.push({ tag, files });
  return built;
}
