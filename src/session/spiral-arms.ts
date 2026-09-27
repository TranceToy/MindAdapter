// The spiral is geometry, not a file: it is the one thing on screen the library
// does not supply, so its shape is fixed here and only its turn and its depth
// are the script's.
// Three arms, each a thinner band, so the frame is dense with them and every
// turn passes a point three times; see ADR 0013.
export const ARMS = 3;
// Three arms over eight turns cross a ray twice as often as one arm over
// twelve, so each band is half as wide as it was.
export const TURNS = 8;
// The viewBox is a square around the centre, sliced to cover the screen, so the
// furthest thing from the centre is the corner at VIEW_HALF × √2. What has to
// reach it is not the end of the arm but the outermost band in every direction,
// and that runs one band spacing short of where the arm ends — so the arm is
// cut well past the corner rather than on it.
export const VIEW_HALF = 100;
export const RADIUS = 165;

const SAMPLES_PER_TURN = 64;
const FULL_TURN = Math.PI * 2;
const PLACES = 2;

const SPACING = RADIUS / TURNS / ARMS;

// Half the radial distance between one turn of the arm and the next, so a lit
// band and the band beside it are the same width and the spiral reads as bands
// rather than wire.
export const STROKE = SPACING / 2;

// The dark band the lit one is drawn on, a whole spacing wide so it fills what
// the lit band leaves: the arm passes ground over light instead of light over
// photograph, and a pass is the step from ground to jade rather than a fraction
// of it (ADR 0011).
export const SHADE = SPACING;

// The radius covered in every direction, not just along the arm: the ray that
// falls past the arm's end is served by the band one spacing inside it.
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
