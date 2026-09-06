import { LIBRARY_STORE, openIndex, settled } from '../library/index-database';
import type { Calibration } from './calibration';

const CALIBRATION_KEY = 'calibration';

export async function loadCalibration(): Promise<Calibration | null> {
  const database = await openIndex();
  const transaction = database.transaction(LIBRARY_STORE, 'readonly');
  const store = transaction.objectStore(LIBRARY_STORE);
  const read = store.get(CALIBRATION_KEY);
  const stored = await settled(read);
  database.close();
  return (stored as Calibration | undefined) ?? null;
}

export async function saveCalibration(calibration: Calibration): Promise<void> {
  const database = await openIndex();
  const transaction = database.transaction(LIBRARY_STORE, 'readwrite');
  const store = transaction.objectStore(LIBRARY_STORE);
  const write = store.put(calibration, CALIBRATION_KEY);
  await settled(write);
  database.close();
}
