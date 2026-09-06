import {
  BED_KEY,
  DEFAULT_BED,
  DEFAULT_PACE,
  PACE_KEY,
  SPIRAL_KEY,
  VOICE_KEY,
  readBedPair,
  readPace,
  readSpiral,
  readTagList,
} from './declaration-values';
import type { BedPair, Spiral } from './declaration-values';
import type { DeclarationBlock, ParsedScript } from './parse-script';

const NO_VOICE: string[] = [];

// What a block said about the spiral, which is not the same as what it holds:
// a block that declares nothing inherits the running spiral, a block that
// declares an empty value stops it.
type SpiralHold = {
  spiral: Spiral | null;
};

export type Segment = {
  tags: string[];
  bed: BedPair;
  voice: string[];
  pace: number;
  spiral: Spiral | null;
  words: string[];
};

export function resolveSegments(script: ParsedScript): Segment[] {
  let bed = declaredBed(script.head) ?? DEFAULT_BED;
  let voice = declaredVoice(script.head) ?? NO_VOICE;
  let pace = declaredPace(script.head) ?? DEFAULT_PACE;
  let spiral = declaredSpiral(script.head)?.spiral ?? null;
  const segments: Segment[] = [];
  for (const parsed of script.segments) {
    bed = declaredBed(parsed.block) ?? bed;
    voice = declaredVoice(parsed.block) ?? voice;
    pace = declaredPace(parsed.block) ?? pace;
    // Not a ?? like the three above it, because the value a spiral declaration
    // holds may itself be nothing, and that nothing is a stop rather than an
    // inheritance.
    const held = declaredSpiral(parsed.block);
    if (held) spiral = held.spiral;
    const segment = { tags: parsed.tags, bed, voice, pace, spiral, words: parsed.words };
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

function declaredSpiral(block: DeclarationBlock): SpiralHold | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== SPIRAL_KEY) continue;
    return { spiral: readSpiral(entry.value) };
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
