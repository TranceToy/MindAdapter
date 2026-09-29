// The spiral is geometry, not a file: it is the one thing on screen the library
// does not supply, so its shape is fixed here and only its turn and its depth
// are the script's.
// Two arms winding out logarithmically, so the bands widen and part as they
// leave the centre and a turn reads as the pattern pouring in or out; see
// ADR 0014.
export const ARMS = 2;
// Each band crossing a ray lies this many times further out than the one
// inside it, whichever arm it belongs to.
export const GROWTH = 1.745;
// The viewBox is a square around the centre, sliced to cover the screen, so the
// furthest thing from the centre is the corner at VIEW_HALF × √2. Every ray is
// crossed by a band no more than one growth step short of where the arms end,
// so the arms are cut that far past the corner.
export const VIEW_HALF = 100;
export const RADIUS = 260;
export const BAND_REACH = RADIUS / GROWTH;
// Where the arms begin, well inside the hub that hides their tangle.
export const INNER = 0.5;

// Half-widths of the bands laid along each arm, as shares of the step from one
// crossing to the next. The shade is a little over half, so the two arms' dark
// bands overlap and leave no seam of photograph between them; the glow and the
// halo fade the lit core out into it.
export const SHADE = 0.52;
export const HALO = 0.21;
export const GLOW = 0.12;
export const CORE = 0.076;

// The centre goes to ground over this radius, solid across its inner share.
export const HUB_RADIUS = 14;
export const HUB_SOLID = 0.35;

const SAMPLES_PER_TURN = 128;
const FULL_TURN = Math.PI * 2;
const PLACES = 2;
const ARM_SPREAD = FULL_TURN / ARMS;
const RISE = Math.log(GROWTH) / ARM_SPREAD;

export function armBands(halfWidth: number): string[] {
  const paths: string[] = [];
  for (let arm = 0; arm < ARMS; arm += 1) paths.push(bandPath(arm, halfWidth));
  return paths;
}

function bandPath(arm: number, halfWidth: number): string {
  const offset = arm * ARM_SPREAD;
  const first = Math.log(INNER) / RISE;
  const last = Math.log(RADIUS) / RISE;
  const samples = Math.ceil(((last - first) / FULL_TURN) * SAMPLES_PER_TURN);
  const edge = GROWTH ** halfWidth;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let sample = 0; sample <= samples; sample += 1) {
    const swept = first + (sample / samples) * (last - first);
    const radius = Math.exp(RISE * swept);
    const angle = swept + offset;
    outer.push(pointAt(radius * edge, angle));
    inner.push(pointAt(radius / edge, angle));
  }
  inner.reverse();
  return `M ${[...outer, ...inner].join(' L ')} Z`;
}

function pointAt(radius: number, angle: number): string {
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  return `${round(x)} ${round(y)}`;
}

function round(value: number): number {
  return Number(value.toFixed(PLACES));
}
