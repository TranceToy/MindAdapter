import { SCRIPTS_FOLDER } from '../library/library-root';
import { isScript, scriptName } from './script-allowlist';
import type { ScriptFile } from './validate-script';

export async function readScripts(root: FileSystemDirectoryHandle): Promise<ScriptFile[]> {
  const folder = await openScripts(root);
  if (!folder) return [];
  const files: ScriptFile[] = [];
  for await (const [fileName, handle] of folder.entries()) {
    if (handle.kind !== 'file') continue;
    if (!isScript(fileName)) continue;
    const file = await readScript(handle as FileSystemFileHandle, fileName);
    if (file) files.push(file);
  }
  return files;
}

// No scripts folder is an empty selection screen, which the user can cure by
// putting a script in the library. It is not a reason to refuse the library.
async function openScripts(
  root: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await root.getDirectoryHandle(SCRIPTS_FOLDER);
  } catch {
    return null;
  }
}

async function readScript(
  handle: FileSystemFileHandle,
  fileName: string,
): Promise<ScriptFile | null> {
  try {
    const file = await handle.getFile();
    const text = await file.text();
    const name = scriptName(fileName);
    return { name, text };
  } catch {
    return null;
  }
}
