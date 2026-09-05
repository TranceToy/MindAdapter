import { CLIPS_FOLDER, IMAGES_FOLDER } from '../library/library-root';
import { VOICE_KEY, readTagList } from './declaration-values';
import { libraryFinding } from './finding';
import type { Finding } from './finding';
import {
  emptyClipPoolLine,
  emptyImagePoolLine,
  missingClipPoolLine,
  missingImagePoolLine,
} from './finding-copy';
import { allBlocks } from './parse-script';
import type { ParsedScript } from './parse-script';

export type PoolCounts = ReadonlyMap<string, number>;

export type Inventory = {
  images: PoolCounts;
  clips: PoolCounts;
};

type TagMention = {
  tag: string;
  line: number;
};

export function assetFindings(script: ParsedScript, inventory: Inventory): Finding[] {
  const images = firstMentions(imageMentions(script));
  const clips = firstMentions(voiceMentions(script));
  const findings = imagePoolFindings(images, inventory.images);
  const bound = clipPoolFindings(clips, inventory.clips);
  findings.push(...bound);
  return findings;
}

function imageMentions(script: ParsedScript): TagMention[] {
  const mentions: TagMention[] = [];
  for (const segment of script.segments) {
    for (const tag of segment.tags) mentions.push({ tag, line: segment.line });
  }
  return mentions;
}

function voiceMentions(script: ParsedScript): TagMention[] {
  const mentions: TagMention[] = [];
  for (const block of allBlocks(script)) {
    for (const entry of block) {
      if (entry.kind !== 'declaration' || entry.key !== VOICE_KEY) continue;
      for (const tag of readTagList(entry.value)) mentions.push({ tag, line: entry.line });
    }
  }
  return mentions;
}

function firstMentions(mentions: TagMention[]): TagMention[] {
  const first = new Map<string, TagMention>();
  for (const mention of mentions) {
    if (first.has(mention.tag)) continue;
    first.set(mention.tag, mention);
  }
  return [...first.values()];
}

function imagePoolFindings(mentions: TagMention[], pools: PoolCounts): Finding[] {
  const findings: Finding[] = [];
  for (const mention of mentions) {
    const held = pools.get(mention.tag);
    if (held === undefined) {
      const message = missingImagePoolLine(mention.tag, mention.line);
      const missing = poolFinding(IMAGES_FOLDER, mention.tag, message);
      findings.push(missing);
      continue;
    }
    if (held > 0) continue;
    const message = emptyImagePoolLine(mention.tag, mention.line);
    const empty = poolFinding(IMAGES_FOLDER, mention.tag, message);
    findings.push(empty);
  }
  return findings;
}

function clipPoolFindings(mentions: TagMention[], pools: PoolCounts): Finding[] {
  const findings: Finding[] = [];
  for (const mention of mentions) {
    const held = pools.get(mention.tag);
    if (held === undefined) {
      const message = missingClipPoolLine(mention.tag, mention.line);
      const missing = poolFinding(CLIPS_FOLDER, mention.tag, message);
      findings.push(missing);
      continue;
    }
    if (held > 0) continue;
    const message = emptyClipPoolLine(mention.tag, mention.line);
    const empty = poolFinding(CLIPS_FOLDER, mention.tag, message);
    findings.push(empty);
  }
  return findings;
}

function poolFinding(folder: string, tag: string, message: string): Finding {
  const path = `${folder}/${tag}/`;
  return libraryFinding(path, message);
}
