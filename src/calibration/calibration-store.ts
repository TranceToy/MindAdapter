import { LIBRARY_STORE, openIndex, settled } from '../library/index-database';
import type { Calibration } from './calibration';

const CALIBRATION_KEY = 'calibration';

export async function loadCalibration(): Promise<Calibration | null> {
  const database = await openIndex();
  if (!database) return null;
  try {
    const transaction = database.transaction(LIBRARY_STORE, 'readonly');
    const store = transaction.objectStore(LIBRARY_STORE);
    const read = store.get(CALIBRATION_KEY);
    const stored = await settled(read);
    return (stored as Calibration | undefined) ?? null;
  } catch {
    return null;
  } finally {
    database.close();
  }
}

// Levels that cannot be kept are levels set again at the next launch, which is
// the first-run path and needs no recovery case of its own.
export async function saveCalibration(calibration: Calibration): Promise<void> {
  const database = await openIndex();
  if (!database) return;
  try {
    const transaction = database.transaction(LIBRARY_STORE, 'readwrite');
    const store = transaction.objectStore(LIBRARY_STORE);
    const write = store.put(calibration, CALIBRATION_KEY);
    await settled(write);
  } catch {
    return;
  } finally {
    database.close();
  }
}
