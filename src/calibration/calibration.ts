export type Calibration = {
  voice: number;
  bed: number;
};

// Headroom by construction, and the top of each track is where it sits. An
// oscillator is a full-scale sine, so a bed reaching unity leaves the output no
// room at all and a suggestion summing onto it drives the mix past the ceiling,
// where the tone turns to buzz and takes the voice with it. The two ceilings
// together cannot reach full scale: a clip is capped at a 0.99 peak by its own
// scan, and 0.6 + 0.3 x 0.99 leaves the ending fade something to fade.
const BED_CEILING = 0.6;
const VOICE_CEILING = 0.3;

// Loudness is heard closer to logarithmically than to amplitude, so a track
// mapped straight onto gain spends most of its travel between loud and slightly
// less loud and crushes every quiet setting into its last centimetre. Squaring
// hands the low end back the room it needs to be set in.
const TAPER = 2;

// Where the tracks stand before the user has touched them, which is the level
// every session ran at before there were tracks.
export const FULL_CALIBRATION: Calibration = { voice: 1, bed: 1 };

export function voiceLevel(calibration: Calibration): number {
  return level(calibration.voice, VOICE_CEILING);
}

export function bedLevel(calibration: Calibration): number {
  return level(calibration.bed, BED_CEILING);
}

function level(position: number, ceiling: number): number {
  return position ** TAPER * ceiling;
}
