const DATABASE_NAME = 'adapting-the-mind';
const DATABASE_VERSION = 2;

export const LIBRARY_STORE = 'library';
export const CLIP_STORE = 'clips';

// The index is expendable by design, and a browser that refuses it — private
// window, blocked site data, no IndexedDB at all — costs a measurement pass and
// a calibration, never content. So every read of it may come back with nothing.
export async function openIndex(): Promise<IDBDatabase | null> {
  try {
    const opening = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    opening.onupgradeneeded = () => addMissingStores(opening.result);
    return await settled(opening);
  } catch {
    return null;
  }
}

export function settled<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function addMissingStores(database: IDBDatabase): void {
  const present = database.objectStoreNames;
  if (!present.contains(LIBRARY_STORE)) database.createObjectStore(LIBRARY_STORE);
  if (!present.contains(CLIP_STORE)) database.createObjectStore(CLIP_STORE);
}
