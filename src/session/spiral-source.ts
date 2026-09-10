import { SHADE, STROKE, VIEW_HALF, armPaths } from './spiral-arms';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export type SpiralArms = {
  element: SVGElement;
  turn: (angle: number) => void;
};

// Built once and turned by a transform from then on, so a session's whole
// spiral costs one paint of geometry and nothing per frame but a rotation.
//
// What turns is the drawing inside the frame, never the frame: an SVG clips to
// its own box, so rotating the element would swing that box off the screen
// corners and leave them bare. The box stays where the screen is and the arms
// go round inside it.
export function createSpiralArms(): SpiralArms {
  const drawing = document.createElementNS(SVG_NAMESPACE, 'g');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('class', 'spiral__arms');
  svg.setAttribute('viewBox', viewBox());
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  for (const path of armPaths()) drawing.append(...createArm(path));
  svg.append(drawing);

  // The attribute rather than the style, because an SVG rotate() is about the
  // user space origin the arms are drawn around, where a CSS one would be
  // about a corner of the box unless it were told otherwise.
  function turn(angle: number): void {
    drawing.setAttribute('transform', `rotate(${angle})`);
  }

  return { element: svg, turn };
}

// Two bands on one path: the wide dark one first, then the lit one half its
// width on top of it, so the arm carries its own gap and the step across it is
// ground to light rather than photograph to light.
function createArm(path: string): SVGElement[] {
  const shade = createBand(path, 'spiral__shade', SHADE);
  const band = createBand(path, 'spiral__band', STROKE);
  return [shade, band];
}

function createBand(path: string, className: string, width: number): SVGElement {
  const band = document.createElementNS(SVG_NAMESPACE, 'path');
  band.setAttribute('class', className);
  band.setAttribute('d', path);
  band.setAttribute('fill', 'none');
  band.setAttribute('stroke-width', String(width));
  return band;
}

// The square the arms are centred in. They run past it, and slice keeps that
// overrun on screen rather than fitting the square inside the box and leaving
// the corners of a wide one bare.
function viewBox(): string {
  const side = VIEW_HALF * 2;
  return `${-VIEW_HALF} ${-VIEW_HALF} ${side} ${side}`;
}
