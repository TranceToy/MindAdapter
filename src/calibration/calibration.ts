export type Calibration = {
  voice: number;
  bed: number;
  snap: number;
};

// Headroom by construction, and the top of each track is where it sits. An
// oscillator is a full-scale sine, so a bed reaching unity leaves the output no
// room at all and a suggestion summing onto it drives the mix past the ceiling,
// where the tone turns to buzz and takes the voice with it. What a session
// holds continuously is these two, and the two of them together cannot reach
// full scale: a clip is capped at a 0.99 peak by its own scan, and
// 0.6 + 0.3 x 0.99 leaves the ending fade something to fade.
const BED_CEILING = 0.6;
const VOICE_CEILING = 0.3;

// The snap is the one thing in the mix meant to be heard over the rest rather
// than under it, and it is a tenth of a second long. It is deliberately outside
// the headroom the other two are held inside: at the top of all three tracks a
// strike landing on a clip's peak on the bed's peak passes full scale for that
// tenth of a second, which is a moment of clipping in a broadband transient and
// not a tone turning to buzz. A trigger word that cannot be heard over the bed
// is the failure this exists to avoid; the track under it is the way down.
const SNAP_CEILING = 0.5;

// Loudness is heard closer to logarithmically than to amplitude, so a track
// mapped straight onto gain spends most of its travel between loud and slightly
// less loud and crushes every quiet setting into its last centimetre. Squaring
// hands the low end back the room it needs to be set in.
const TAPER = 2;

// Where the tracks stand before the user has touched them, which is the level
// every session ran at before there were tracks.
export const FULL_CALIBRATION: Calibration = { voice: 1, bed: 1, snap: 1 };

export function voiceLevel(calibration: Calibration): number {
  return level(calibration.voice, VOICE_CEILING);
}

export function bedLevel(calibration: Calibration): number {
  return level(calibration.bed, BED_CEILING);
}

export function snapLevel(calibration: Calibration): number {
  return level(calibration.snap, SNAP_CEILING);
}

// What the index hands back is whatever was written to it, which may be a
// calibration from before a track existed or a record no longer worth trusting.
// A level that is not there is read as the top of its track — where that track
// stood before it was one — rather than as silence, which is a level the user
// would have had to set for themselves.
export function restoreCalibration(stored: Partial<Calibration>): Calibration {
  return {
    voice: restored(stored.voice),
    bed: restored(stored.bed),
    snap: restored(stored.snap),
  };
}

function restored(held: number | undefined): number {
  if (typeof held !== 'number' || !Number.isFinite(held)) return 1;
  return Math.min(Math.max(held, 0), 1);
}

function level(position: number, ceiling: number): number {
  return position ** TAPER * ceiling;
}
