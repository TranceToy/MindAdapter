import type { Photograph } from './image-source';

export type ImageField = {
  element: HTMLElement;
  draw: (photograph: Photograph | null) => void;
};

// The swap is a hard cut and nothing here transitions, so the session carries
// no animation at all. Null is a segment that bound no tags: black, with the
// word's halo simply invisible on it.
export function createImageField(): ImageField {
  const element = document.createElement('div');
  element.className = 'imagery';
  let held: Photograph | null = null;

  function draw(photograph: Photograph | null): void {
    const leaving = held;
    held = photograph;
    if (photograph) element.replaceChildren(photograph.element);
    else element.replaceChildren();
    if (leaving) leaving.release();
  }

  return { element, draw };
}
