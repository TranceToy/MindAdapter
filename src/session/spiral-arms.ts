// The spiral is geometry, not a file: it is the one thing on screen the library
// does not supply, so its shape is fixed here and only its turn and its depth
// are the script's.
// Two, not three: every arm ends at the centre, so the arms are also how
// crowded the middle of the screen is, and a third one turns that meeting into
// a knot the eye goes to instead of a spiral it falls into.
export const ARMS = 2;
export const TURNS = 6;
// The viewBox is a square around the centre, sliced to cover the screen, so the
// furthest thing from the centre is the corner at VIEW_HALF × √2. What has to
// reach it is not the end of an arm but the outermost band in every direction,
// and that runs one band spacing short of where the arms end — so the arms are
// cut well past the corner rather than on it.
export const VIEW_HALF = 100;
export const RADIUS = 165;

const SAMPLES_PER_TURN = 64;
const FULL_TURN = Math.PI * 2;
const PLACES = 2;

const SPACING = RADIUS / TURNS / ARMS;

// Half the radial distance between one arm and the next, so a line and the gap
// beside it are the same width and the spiral reads as bands rather than wire.
export const STROKE = SPACING / 2;

// The radius covered in every direction, not just along an arm: the ray that
// falls between two arm ends is served by the band one spacing inside them.
export const BAND_REACH = RADIUS - SPACING;

export function armPaths(): string[] {
  const paths: string[] = [];
  for (let arm = 0; arm < ARMS; arm += 1) paths.push(armPath(arm));
  return paths;
}

function armPath(arm: number): string {
  const offset = (arm * FULL_TURN) / ARMS;
  const samples = TURNS * SAMPLES_PER_TURN;
  const steps: string[] = [];
  for (let sample = 0; sample <= samples; sample += 1) {
    const swept = (sample / samples) * TURNS * FULL_TURN;
    const point = pointAt(swept, offset);
    steps.push(point);
  }
  return `M ${steps.join(' L ')}`;
}

function pointAt(swept: number, offset: number): string {
  const radius = (swept / (TURNS * FULL_TURN)) * RADIUS;
  const angle = swept + offset;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  return `${round(x)} ${round(y)}`;
}

function round(value: number): number {
  return Number(value.toFixed(PLACES));
}
