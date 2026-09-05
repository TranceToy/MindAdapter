import type { LibraryFile } from '../library/walk-library';

export type Roll = () => number;

// A repeat reads as a missed transition rather than as a draw, so the file on
// screen is out of the running whenever anything else is available.
export function drawImage(
  pool: LibraryFile[],
  previous: string | null,
  roll: Roll,
): LibraryFile | null {
  const candidates = withoutRepeat(pool, previous);
  const drawn = Math.floor(roll() * candidates.length);
  return candidates[drawn] ?? null;
}

function withoutRepeat(pool: LibraryFile[], previous: string | null): LibraryFile[] {
  if (pool.length < 2) return pool;
  return pool.filter((file) => file.path !== previous);
}
