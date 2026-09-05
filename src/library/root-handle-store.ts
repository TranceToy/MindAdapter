import { LIBRARY_STORE, openIndex, settled } from './index-database';

const ROOT_KEY = 'root';

export async function loadRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  const database = await openIndex();
  const transaction = database.transaction(LIBRARY_STORE, 'readonly');
  const store = transaction.objectStore(LIBRARY_STORE);
  const read = store.get(ROOT_KEY);
  const stored = await settled(read);
  database.close();
  return (stored as FileSystemDirectoryHandle | undefined) ?? null;
}

export async function saveRootHandle(root: FileSystemDirectoryHandle): Promise<void> {
  const database = await openIndex();
  const transaction = database.transaction(LIBRARY_STORE, 'readwrite');
  const store = transaction.objectStore(LIBRARY_STORE);
  const write = store.put(root, ROOT_KEY);
  await settled(write);
  database.close();
}

export function requestPersistentIndex(): void {
  void navigator.storage.persist();
}
