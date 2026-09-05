import type { LibraryFile, Pool } from '../library/walk-library';

// A flat union, so weighting is what the user put in the folders: two tags over
// a 200-file and a 5-file pool is one 205-file draw, not a half-share each.
export function bindPools(pools: Pool[], tags: string[]): LibraryFile[] {
  const bound: LibraryFile[] = [];
  const taken = new Set<string>();
  for (const tag of tags) {
    if (taken.has(tag)) continue;
    taken.add(tag);
    const pool = pools.find((held) => held.tag === tag);
    if (!pool) continue;
    bound.push(...pool.files);
  }
  return bound;
}
