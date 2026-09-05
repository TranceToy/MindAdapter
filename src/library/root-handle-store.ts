const DATABASE_NAME = 'adapting-the-mind';
const DATABASE_VERSION = 1;
const STORE_NAME = 'library';
const ROOT_KEY = 'root';

export async function loadRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const read = store.get(ROOT_KEY);
  const stored = await settled(read);
  database.close();
  return (stored as FileSystemDirectoryHandle | undefined) ?? null;
}

export async function saveRootHandle(root: FileSystemDirectoryHandle): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const write = store.put(root, ROOT_KEY);
  await settled(write);
  database.close();
}

export function requestPersistentIndex(): void {
  void navigator.storage.persist();
}

function openDatabase(): Promise<IDBDatabase> {
  const opening = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  opening.onupgradeneeded = () => opening.result.createObjectStore(STORE_NAME);
  return settled(opening);
}

function settled<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
