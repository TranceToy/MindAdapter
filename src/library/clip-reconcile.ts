import type { ClipMeasurement } from './clip-measurement';
import type { ClipRecord } from './clip-index';
import type { LibraryFile, Pool } from './walk-library';

export type MeasuredClip = LibraryFile & ClipMeasurement;

export type ClipPlan = {
  tag: string;
  known: MeasuredClip[];
  pending: LibraryFile[];
};

export function planMeasurement(pools: Pool[], records: Map<string, ClipRecord>): ClipPlan[] {
  const plans: ClipPlan[] = [];
  for (const pool of pools) {
    const known: MeasuredClip[] = [];
    const pending: LibraryFile[] = [];
    for (const file of pool.files) {
      const record = records.get(file.path);
      if (
        record === undefined
        || record.size !== file.size
        || record.lastModified !== file.lastModified
      ) {
        pending.push(file);
        continue;
      }
      const restored = { ...file, ...record };
      known.push(restored);
    }
    const plan = { tag: pool.tag, known, pending };
    plans.push(plan);
  }
  return plans;
}

export function countPending(plans: ClipPlan[]): number {
  let pending = 0;
  for (const plan of plans) pending += plan.pending.length;
  return pending;
}

export function clipPaths(pools: Pool[]): Set<string> {
  const paths = new Set<string>();
  for (const pool of pools) {
    for (const file of pool.files) paths.add(file.path);
  }
  return paths;
}

export function toClipRecord(clip: MeasuredClip): ClipRecord {
  return {
    path: clip.path,
    size: clip.size,
    lastModified: clip.lastModified,
    rmsScalar: clip.rmsScalar,
    peak: clip.peak,
    duration: clip.duration,
  };
}
