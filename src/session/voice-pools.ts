import type { MeasuredClip } from '../library/clip-reconcile';
import type { ClipPool } from '../library/scan-library';

// A flat union, so weighting is what the user put in the folders: two tags over
// a 40-clip and a 5-clip pool is one 45-clip draw, not a half-share each.
export function bindClips(pools: ClipPool[], tags: string[]): MeasuredClip[] {
  const bound: MeasuredClip[] = [];
  const taken = new Set<string>();
  for (const tag of tags) {
    if (taken.has(tag)) continue;
    taken.add(tag);
    const pool = pools.find((held) => held.tag === tag);
    if (!pool) continue;
    bound.push(...pool.clips);
  }
  return bound;
}
