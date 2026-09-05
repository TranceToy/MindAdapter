import { BED_KEY, VOICE_KEY, readBedPair, readTagList } from './declaration-values';
import type { BedPair } from './declaration-values';
import type { DeclarationBlock, ParsedScript } from './parse-script';

const DEFAULT_BED: BedPair = { carrier: 150, beat: 6 };
const NO_VOICE: string[] = [];

export type Segment = {
  tags: string[];
  bed: BedPair;
  voice: string[];
  words: string[];
};

export function resolveSegments(script: ParsedScript): Segment[] {
  let bed = declaredBed(script.head) ?? DEFAULT_BED;
  let voice = declaredVoice(script.head) ?? NO_VOICE;
  const segments: Segment[] = [];
  for (const parsed of script.segments) {
    bed = declaredBed(parsed.block) ?? bed;
    voice = declaredVoice(parsed.block) ?? voice;
    const segment = { tags: parsed.tags, bed, voice, words: parsed.words };
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

function declaredVoice(block: DeclarationBlock): string[] | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== VOICE_KEY) continue;
    return readTagList(entry.value);
  }
  return null;
}
