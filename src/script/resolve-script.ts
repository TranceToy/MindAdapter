import {
  BED_KEY,
  DEFAULT_BED,
  DEFAULT_PACE,
  PACE_KEY,
  SPIRAL_KEY,
  VOICE_KEY,
  readBedPair,
  readPace,
  readSpirals,
  readTagList,
} from './declaration-values';
import type { BedPair, Spiral } from './declaration-values';
import type { DeclarationBlock, ParsedScript } from './parse-script';

const NO_VOICE: string[] = [];
const NO_SPIRAL: Spiral[] = [];

// What a block said about the spiral, which is not the same as what it holds:
// a block that declares nothing inherits the running spirals, a block that
// declares an empty value stops them.
type SpiralHold = {
  spirals: Spiral[];
};

export type Segment = {
  tags: string[];
  bed: BedPair;
  voice: string[];
  pace: number;
  spirals: Spiral[];
  words: string[];
};

export function resolveSegments(script: ParsedScript): Segment[] {
  let bed = declaredBed(script.head) ?? DEFAULT_BED;
  let voice = declaredVoice(script.head) ?? NO_VOICE;
  let pace = declaredPace(script.head) ?? DEFAULT_PACE;
  let spirals = declaredSpirals(script.head)?.spirals ?? NO_SPIRAL;
  const segments: Segment[] = [];
  for (const parsed of script.segments) {
    bed = declaredBed(parsed.block) ?? bed;
    voice = declaredVoice(parsed.block) ?? voice;
    pace = declaredPace(parsed.block) ?? pace;
    // Not a ?? like the three above it, because the value a spiral declaration
    // holds may itself be nothing, and that nothing is a stop rather than an
    // inheritance.
    const held = declaredSpirals(parsed.block);
    if (held) spirals = held.spirals;
    const segment = { tags: parsed.tags, bed, voice, pace, spirals, words: parsed.words };
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

function declaredSpirals(block: DeclarationBlock): SpiralHold | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== SPIRAL_KEY) continue;
    return { spirals: readSpirals(entry.value) ?? NO_SPIRAL };
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
