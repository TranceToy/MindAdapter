export const SAMPLE_SIZE = 100;

const WIDTH_BOUND = 0.92;
const HEIGHT_BOUND = 0.3;

export type Viewport = {
  width: number;
  height: number;
};

export type MeasureWord = (word: string) => number;

export function fittedSize(sampleWidth: number, view: Viewport): number {
  const byHeight = view.height * HEIGHT_BOUND;
  if (sampleWidth <= 0) return byHeight;
  const byWidth = (view.width * WIDTH_BOUND * SAMPLE_SIZE) / sampleWidth;
  return Math.min(byHeight, byWidth);
}

export function widestWord(words: string[], measure: MeasureWord): string {
  let widest = '';
  let width = 0;
  for (const word of new Set(words)) {
    const measured = measure(word);
    if (measured <= width) continue;
    widest = word;
    width = measured;
  }
  return widest;
}
