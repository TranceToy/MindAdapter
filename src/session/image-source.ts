import type { FileSource } from '../library/library-source';
import type { LibraryFile } from '../library/walk-library';
import { drawImage } from './image-draw';

export type Photograph = {
  path: string;
  element: HTMLImageElement;
  release: () => void;
};

// A file that has gone since the scan costs the next candidate and nothing
// else; a pool that has gone entirely leaves the layer blank and the session
// runs on.
export async function drawPhotograph(
  pool: LibraryFile[],
  previous: string | null,
): Promise<Photograph | null> {
  const candidates = [...pool];
  while (candidates.length > 0) {
    const file = drawImage(candidates, previous, Math.random);
    if (!file) return null;
    const photograph = await readPhotograph(file);
    if (photograph) return photograph;
    discard(candidates, file);
  }
  return null;
}

async function readPhotograph(file: LibraryFile): Promise<Photograph | null> {
  const blob = await openFile(file.handle);
  if (!blob) return null;
  return decodePhotograph(file.path, blob);
}

async function openFile(handle: FileSource): Promise<File | null> {
  try {
    return await handle.getFile();
  } catch {
    return null;
  }
}

// Decoded before it is ever appended, so the swap the layer makes is a paint
// and not a load.
async function decodePhotograph(path: string, blob: File): Promise<Photograph | null> {
  const url = URL.createObjectURL(blob);
  const element = document.createElement('img');
  element.className = 'photograph';
  element.src = url;
  const release = () => URL.revokeObjectURL(url);
  try {
    await element.decode();
  } catch {
    release();
    return null;
  }
  return { path, element, release };
}

function discard(pool: LibraryFile[], file: LibraryFile): void {
  const at = pool.indexOf(file);
  pool.splice(at, 1);
}
