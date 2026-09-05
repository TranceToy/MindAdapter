import { clipPaths, countPending, planMeasurement, toClipRecord } from './clip-reconcile';
import type { ClipPlan, MeasuredClip } from './clip-reconcile';
import { loadClipRecords, pruneClipRecords, putClipRecord } from './clip-index';
import { createDecoder, decodeClip } from './decode-clip';
import { CLIPS_FOLDER, IMAGES_FOLDER } from './library-root';
import { measureClip } from './clip-measurement';
import { walkSection } from './walk-library';
import type { LibraryFile, Pool } from './walk-library';

export type ScanProgress = {
  measured: number;
  total: number;
};

export type ReportProgress = (progress: ScanProgress) => void;

export type ClipPool = {
  tag: string;
  clips: MeasuredClip[];
};

export type Library = {
  images: Pool[];
  clips: ClipPool[];
};

export async function scanLibrary(
  root: FileSystemDirectoryHandle,
  report: ReportProgress,
): Promise<Library> {
  const images = await walkSection(root, IMAGES_FOLDER, 'image');
  const pools = await walkSection(root, CLIPS_FOLDER, 'audio');
  const records = await loadClipRecords();
  const plans = planMeasurement(pools, records);
  const clips = await measurePlans(plans, report);
  const walked = clipPaths(pools);
  await pruneClipRecords(walked);
  return { images, clips };
}

async function measurePlans(plans: ClipPlan[], report: ReportProgress): Promise<ClipPool[]> {
  const total = countPending(plans);
  if (total > 0) {
    const start = { measured: 0, total };
    report(start);
  }
  const decoder = createDecoder();
  const pools: ClipPool[] = [];
  let measured = 0;
  for (const plan of plans) {
    const clips = [...plan.known];
    for (const file of plan.pending) {
      const clip = await measureFile(decoder, file);
      if (clip) clips.push(clip);
      measured += 1;
      const progress = { measured, total };
      report(progress);
    }
    const pool = { tag: plan.tag, clips };
    pools.push(pool);
  }
  return pools;
}

async function measureFile(
  decoder: OfflineAudioContext,
  file: LibraryFile,
): Promise<MeasuredClip | null> {
  const buffer = await decodeClip(decoder, file.handle);
  if (!buffer) return null;
  const measurement = measureClip(buffer);
  if (!measurement) return null;
  const clip = { ...file, ...measurement };
  const record = toClipRecord(clip);
  await putClipRecord(record);
  return clip;
}
