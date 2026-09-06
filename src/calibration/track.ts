import { secondary } from '../shell/antechamber';
import { positionWithin } from './track-position';

export type MoveLevel = (position: number) => void;

// A hairline and a dot, and no readout of any kind: the level is set against
// what is sounding, and a percentage invites setting it against the number
// instead. The hairline is one pixel, so the whole block is the grab area and
// only the rail is measured against.
export function renderTrack(label: string, position: number, move: MoveLevel): HTMLElement {
  const dot = document.createElement('div');
  dot.className = 'track__dot';
  const rail = document.createElement('div');
  rail.className = 'track__rail';
  rail.append(dot);
  const name = secondary(label);
  name.classList.add('track__label');
  const track = document.createElement('div');
  track.className = 'track';
  track.append(rail, name);

  function place(at: number): void {
    dot.style.left = `${at * 100}%`;
  }

  function follow(event: PointerEvent): void {
    const bounds = rail.getBoundingClientRect();
    const at = positionWithin(event.clientX, bounds);
    place(at);
    move(at);
  }

  function take(event: PointerEvent): void {
    track.setPointerCapture(event.pointerId);
    follow(event);
  }

  // The capture releases itself when the pointer lifts, so a drag that leaves
  // the block still sets the level and a lift anywhere ends it.
  function drag(event: PointerEvent): void {
    if (!track.hasPointerCapture(event.pointerId)) return;
    follow(event);
  }

  track.addEventListener('pointerdown', take);
  track.addEventListener('pointermove', drag);
  place(position);
  return track;
}
