import { isAsset } from './asset-allowlist';
import type { AssetKind } from './asset-allowlist';
import type { FileSource } from './library-source';

export type LibraryFile = {
  path: string;
  handle: FileSource;
  size: number;
  lastModified: number;
};

export type Pool = {
  tag: string;
  files: LibraryFile[];
};

export async function walkSection(
  root: FileSystemDirectoryHandle,
  section: string,
  kind: AssetKind,
): Promise<Pool[]> {
  const container = await openSection(root, section);
  if (!container) return [];
  const pools: Pool[] = [];
  for await (const [tag, handle] of container.entries()) {
    if (handle.kind !== 'directory') continue;
    const folder = handle as FileSystemDirectoryHandle;
    const prefix = `${section}/${tag}`;
    const files = await collectFiles(folder, prefix, kind);
    const pool = { tag, files };
    pools.push(pool);
  }
  return pools;
}

// A section the library has not got is a layer with no pools, which the scripts
// that ask for one already report as a finding. It is not a reason to stop.
async function openSection(
  root: FileSystemDirectoryHandle,
  section: string,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await root.getDirectoryHandle(section);
  } catch {
    return null;
  }
}

async function collectFiles(
  folder: FileSystemDirectoryHandle,
  prefix: string,
  kind: AssetKind,
): Promise<LibraryFile[]> {
  const files: LibraryFile[] = [];
  for await (const [name, handle] of folder.entries()) {
    const path = `${prefix}/${name}`;
    if (handle.kind === 'directory') {
      const nested = await collectFiles(handle as FileSystemDirectoryHandle, path, kind);
      files.push(...nested);
      continue;
    }
    if (!isAsset(name, kind)) continue;
    const stamped = await stamp(handle as FileSystemFileHandle, path);
    files.push(stamped);
  }
  return files;
}

async function stamp(handle: FileSystemFileHandle, path: string): Promise<LibraryFile> {
  const file = await handle.getFile();
  return { path, handle, size: file.size, lastModified: file.lastModified };
}
