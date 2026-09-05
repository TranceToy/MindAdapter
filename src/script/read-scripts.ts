import { SCRIPTS_FOLDER } from '../library/library-root';
import { isScript, scriptName } from './script-allowlist';
import type { ScriptFile } from './validate-script';

export async function readScripts(root: FileSystemDirectoryHandle): Promise<ScriptFile[]> {
  const folder = await root.getDirectoryHandle(SCRIPTS_FOLDER);
  const files: ScriptFile[] = [];
  for await (const [fileName, handle] of folder.entries()) {
    if (handle.kind !== 'file') continue;
    if (!isScript(fileName)) continue;
    const file = await readScript(handle as FileSystemFileHandle, fileName);
    files.push(file);
  }
  return files;
}

async function readScript(handle: FileSystemFileHandle, fileName: string): Promise<ScriptFile> {
  const file = await handle.getFile();
  const text = await file.text();
  const name = scriptName(fileName);
  return { name, text };
}
