import { LIBRARY_STORE, openIndex, settled } from './index-database';

const ROOT_KEY = 'root';

export async function loadRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  const database = await openIndex();
  if (!database) return null;
  try {
    const transaction = database.transaction(LIBRARY_STORE, 'readonly');
    const store = transaction.objectStore(LIBRARY_STORE);
    const read = store.get(ROOT_KEY);
    const stored = await settled(read);
    return (stored as FileSystemDirectoryHandle | undefined) ?? null;
  } catch {
    return null;
  } finally {
    database.close();
  }
}

// A handle a browser will not store is a folder picked again next launch, which
// is what a browser without handles does anyway.
export async function saveRootHandle(root: FileSystemDirectoryHandle): Promise<void> {
  const database = await openIndex();
  if (!database) return;
  try {
    const transaction = database.transaction(LIBRARY_STORE, 'readwrite');
    const store = transaction.objectStore(LIBRARY_STORE);
    const write = store.put(root, ROOT_KEY);
    await settled(write);
  } catch {
    return;
  } finally {
    database.close();
  }
}

export function requestPersistentIndex(): void {
  if (!navigator.storage?.persist) return;
  void navigator.storage.persist();
}
