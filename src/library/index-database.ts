const DATABASE_NAME = 'adapting-the-mind';
const DATABASE_VERSION = 2;

export const LIBRARY_STORE = 'library';
export const CLIP_STORE = 'clips';

export function openIndex(): Promise<IDBDatabase> {
  const opening = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  opening.onupgradeneeded = () => addMissingStores(opening.result);
  return settled(opening);
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
