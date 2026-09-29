import {
  CORE,
  GLOW,
  HALO,
  HUB_RADIUS,
  HUB_SOLID,
  SHADE,
  VIEW_HALF,
  armBands,
} from './spiral-arms';

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
//
// The place names the hub's gradient, since two sets share the document and an
// id must be one element's.
export function createSpiralArms(place: number): SpiralArms {
  const hubId = `spiral-hub-${place}`;
  const drawing = document.createElementNS(SVG_NAMESPACE, 'g');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('class', 'spiral__arms');
  svg.setAttribute('viewBox', viewBox());
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  drawing.append(...createBands());
  const hubGradient = createHubGradient(hubId);
  const hub = createHub(hubId);
  svg.append(hubGradient, drawing, hub);

  // The attribute rather than the style, because an SVG rotate() is about the
  // user space origin the arms are drawn around, where a CSS one would be
  // about a corner of the box unless it were told otherwise.
  function turn(angle: number): void {
    drawing.setAttribute('transform', `rotate(${angle})`);
  }

  return { element: svg, turn };
}

// Widest first, so every dark band goes down before any light and each lighter
// band lands on the ones it fades into.
function createBands(): SVGElement[] {
  const shades = armBands(SHADE).map((path) => createBand(path, 'spiral__shade'));
  const halos = armBands(HALO).map((path) => createBand(path, 'spiral__halo'));
  const glows = armBands(GLOW).map((path) => createBand(path, 'spiral__glow'));
  const cores = armBands(CORE).map((path) => createBand(path, 'spiral__band'));
  return [...shades, ...halos, ...glows, ...cores];
}

function createBand(path: string, className: string): SVGElement {
  const band = document.createElementNS(SVG_NAMESPACE, 'path');
  band.setAttribute('class', className);
  band.setAttribute('d', path);
  return band;
}

function createHubGradient(id: string): SVGElement {
  const gradient = document.createElementNS(SVG_NAMESPACE, 'radialGradient');
  gradient.setAttribute('id', id);
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
  gradient.setAttribute('cx', '0');
  gradient.setAttribute('cy', '0');
  gradient.setAttribute('r', String(HUB_RADIUS));
  const solid = createHubStop(HUB_SOLID, 1);
  const clear = createHubStop(1, 0);
  gradient.append(solid, clear);
  return gradient;
}

function createHubStop(offset: number, opacity: number): SVGElement {
  const stop = document.createElementNS(SVG_NAMESPACE, 'stop');
  stop.setAttribute('class', 'spiral__hub-stop');
  stop.setAttribute('offset', String(offset));
  stop.setAttribute('stop-opacity', String(opacity));
  return stop;
}

// Round, so it needs no turning and stays outside the drawing that does.
function createHub(gradientId: string): SVGElement {
  const hub = document.createElementNS(SVG_NAMESPACE, 'circle');
  hub.setAttribute('r', String(HUB_RADIUS));
  hub.setAttribute('fill', `url(#${gradientId})`);
  return hub;
}

// The square the arms are centred in. They run past it, and slice keeps that
// overrun on screen rather than fitting the square inside the box and leaving
// the corners of a wide one bare.
function viewBox(): string {
  const side = VIEW_HALF * 2;
  return `${-VIEW_HALF} ${-VIEW_HALF} ${side} ${side}`;
}
