import {
  BED_KEY,
  DEFAULT_BED,
  DEFAULT_PACE,
  PACE_KEY,
  VOICE_KEY,
  readBedPair,
  readPace,
  readTagList,
} from './declaration-values';
import type { BedPair } from './declaration-values';
import type { DeclarationBlock, ParsedScript } from './parse-script';

const NO_VOICE: string[] = [];

export type Segment = {
  tags: string[];
  bed: BedPair;
  voice: string[];
  pace: number;
  words: string[];
};

export function resolveSegments(script: ParsedScript): Segment[] {
  let bed = declaredBed(script.head) ?? DEFAULT_BED;
  let voice = declaredVoice(script.head) ?? NO_VOICE;
  let pace = declaredPace(script.head) ?? DEFAULT_PACE;
  const segments: Segment[] = [];
  for (const parsed of script.segments) {
    bed = declaredBed(parsed.block) ?? bed;
    voice = declaredVoice(parsed.block) ?? voice;
    pace = declaredPace(parsed.block) ?? pace;
    const segment = { tags: parsed.tags, bed, voice, pace, words: parsed.words };
    segments.push(segment);
  }
  return segments;
}

function declaredBed(block: DeclarationBlock): BedPair | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== BED_KEY) continue;
    return readBedPair(entry.value);
  }
  return null;
}

function declaredPace(block: DeclarationBlock): number | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== PACE_KEY) continue;
    return readPace(entry.value);
  }
  return null;
}

function declaredVoice(block: DeclarationBlock): string[] | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== VOICE_KEY) continue;
    return readTagList(entry.value);
  }
  return null;
}
