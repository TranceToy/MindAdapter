import { scriptName } from '../script/script-allowlist';
import type { ScriptFile } from '../script/validate-script';
import type { AssetKind } from './asset-allowlist';
import { fileName, libraryPath, poolsUnder, scriptFilesUnder } from './group-files';
import type { LibrarySource } from './library-source';
import type { LibraryFile } from './walk-library';

export function filesSource(files: LibraryFile[]): LibrarySource {
  const pools = (section: string, kind: AssetKind) =>
    Promise.resolve(poolsUnder(files, section, kind));
  const scripts = () => readScripts(files);
  return { pools, scripts };
}

// A picked file holds its own bytes for as long as the launch lasts, so it is
// the handle: the layers read it the same way and never learn the difference.
export function libraryFiles(picked: File[]): LibraryFile[] {
  const files: LibraryFile[] = [];
  for (const file of picked) {
    const stamped = stamp(file);
    files.push(stamped);
  }
  return files;
}

function stamp(file: File): LibraryFile {
  const path = libraryPath(file.webkitRelativePath || file.name);
  const handle = { getFile: () => Promise.resolve(file) };
  return { path, handle, size: file.size, lastModified: file.lastModified };
}

async function readScripts(files: LibraryFile[]): Promise<ScriptFile[]> {
  const found = scriptFilesUnder(files);
  const scripts: ScriptFile[] = [];
  for (const file of found) {
    const script = await readScript(file);
    if (script) scripts.push(script);
  }
  return scripts;
}

async function readScript(file: LibraryFile): Promise<ScriptFile | null> {
  try {
    const blob = await file.handle.getFile();
    const text = await blob.text();
    const name = scriptName(fileName(file.path));
    return { name, text };
  } catch {
    return null;
  }
}
