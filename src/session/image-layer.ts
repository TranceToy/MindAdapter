import type { Pool } from '../library/walk-library';
import type { Segment } from '../script/resolve-script';
import type { ImageField } from './image-field';
import { imageSlots, slotAfter } from './image-schedule';
import type { ImageSlot } from './image-schedule';
import { drawPhotograph } from './image-source';
import type { Photograph } from './image-source';
import type { Elapsed } from './session-clock';
import { wordCount } from './session-words';
import { followWords } from './word-cursor';

export type ImageLayer = {
  stop: () => void;
};

export function runImageLayer(
  field: ImageField,
  segments: Segment[],
  pools: Pool[],
  elapsed: Elapsed,
): ImageLayer {
  const slots = imageSlots(segments, pools);
  const cursor = followWords(elapsed, wordCount(segments));
  let previous: string | null = null;
  let running = true;

  // The opening slot is taken as it stands, since the words no longer wait for
  // it; every later one is drawn the moment the current photograph is on screen,
  // so its decode spends the whole hold. Awaiting it after the slot has been
  // reached is what holds a late one: the current frame stays until it lands,
  // and the slot it lands in is the one the words have got to by then.
  async function run(): Promise<void> {
    let slot: ImageSlot | null = slots[0] ?? null;
    let drawing = draw(slot);
    while (slot) {
      const reached = await cursor.reach(slot.at);
      if (!reached) {
        discardDraw(drawing);
        break;
      }
      const photograph = await drawing;
      if (!running) {
        if (photograph) photograph.release();
        break;
      }
      display(photograph);
      slot = slotAfter(slots, cursor.now());
      drawing = draw(slot);
    }
    stop();
  }

  function discardDraw(drawing: Promise<Photograph | null>): void {
    void drawing.then((photograph) => {
      if (photograph) photograph.release();
    });
  }

  function draw(slot: ImageSlot | null): Promise<Photograph | null> {
    if (!slot) return Promise.resolve(null);
    return drawPhotograph(slot.pool, previous);
  }

  function display(photograph: Photograph | null): void {
    field.draw(photograph);
    if (photograph) previous = photograph.path;
  }

  // The last slot leaves its photograph where it is: the ending is a still
  // frame going quiet, not a frame being taken away.
  function stop(): void {
    running = false;
    cursor.stop();
  }

  void run();
  return { stop };
}
