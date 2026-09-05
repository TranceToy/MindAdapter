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
  const transaction = database.transaction(CLIP_STORE, 'readonly');
  const store = transaction.objectStore(CLIP_STORE);
  const read = store.getAll() as IDBRequest<ClipRecord[]>;
  const stored = await settled(read);
  database.close();
  return byPath(stored);
}

export async function putClipRecord(record: ClipRecord): Promise<void> {
  const database = await openIndex();
  const transaction = database.transaction(CLIP_STORE, 'readwrite');
  const store = transaction.objectStore(CLIP_STORE);
  const write = store.put(record, record.path);
  await settled(write);
  database.close();
}

export async function pruneClipRecords(keep: Set<string>): Promise<void> {
  const database = await openIndex();
  const transaction = database.transaction(CLIP_STORE, 'readwrite');
  const store = transaction.objectStore(CLIP_STORE);
  const reading = store.getAllKeys();
  const keys = await settled(reading);
  discardKeys(store, keys, keep);
  database.close();
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
