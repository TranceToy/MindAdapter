import { CLIP_STORE, openIndex, settled } from './index-database';

export type ClipRecord = {
  path: string;
  size: number;
  lastModified: number;
  rmsScalar: number;
  peak: number;
  duration: number;
};

export async function loadClipRecords(): Promise<Map<string, ClipRecord>> {
  const database = await openIndex();
  if (!database) return new Map();
  try {
    const transaction = database.transaction(CLIP_STORE, 'readonly');
    const store = transaction.objectStore(CLIP_STORE);
    const read = store.getAll() as IDBRequest<ClipRecord[]>;
    const stored = await settled(read);
    return byPath(stored);
  } catch {
    return new Map();
  } finally {
    database.close();
  }
}

export async function putClipRecord(record: ClipRecord): Promise<void> {
  const database = await openIndex();
  if (!database) return;
  try {
    const transaction = database.transaction(CLIP_STORE, 'readwrite');
    const store = transaction.objectStore(CLIP_STORE);
    const write = store.put(record, record.path);
    await settled(write);
  } catch {
    // A measurement that cannot be kept is a measurement made again next time.
  } finally {
    database.close();
  }
}

export async function pruneClipRecords(keep: Set<string>): Promise<void> {
  const database = await openIndex();
  if (!database) return;
  try {
    const transaction = database.transaction(CLIP_STORE, 'readwrite');
    const store = transaction.objectStore(CLIP_STORE);
    const reading = store.getAllKeys();
    const keys = await settled(reading);
    discardKeys(store, keys, keep);
  } catch {
    // Stale rows cost space and nothing else.
  } finally {
    database.close();
  }
}

function byPath(records: ClipRecord[]): Map<string, ClipRecord> {
  const known = new Map<string, ClipRecord>();
  for (const record of records) known.set(record.path, record);
  return known;
}

function discardKeys(store: IDBObjectStore, keys: IDBValidKey[], keep: Set<string>): void {
  for (const key of keys) {
    if (keep.has(key as string)) continue;
    store.delete(key);
  }
}
