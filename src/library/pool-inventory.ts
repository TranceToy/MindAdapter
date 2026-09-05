import type { Inventory, PoolCounts } from '../script/asset-findings';
import type { ClipPool } from './scan-library';
import type { Pool } from './walk-library';

export function poolInventory(images: Pool[], clips: ClipPool[]): Inventory {
  const held = countImages(images);
  const bound = countClips(clips);
  return { images: held, clips: bound };
}

function countImages(pools: Pool[]): PoolCounts {
  const counts = new Map<string, number>();
  for (const pool of pools) counts.set(pool.tag, pool.files.length);
  return counts;
}

function countClips(pools: ClipPool[]): PoolCounts {
  const counts = new Map<string, number>();
  for (const pool of pools) counts.set(pool.tag, pool.clips.length);
  return counts;
}
