import { SAMPLE_SIZE, fittedSize, widestWord } from './word-size';
import type { Viewport } from './word-size';

export type WordField = {
  element: HTMLElement;
  fit: () => void;
  show: (index: number) => void;
  retire: () => void;
};

export function createWordField(words: string[]): WordField {
  const word = createWord();
  const sample = createSample();
  const element = document.createElement('div');
  element.className = 'field';
  element.append(word, sample);
  let widest: string | null = null;
  let retired = false;

  function measure(text: string): number {
    sample.textContent = text;
    return sample.getBoundingClientRect().width;
  }

  function fit(): void {
    if (retired) return;
    if (widest === null) widest = widestWord(words, measure);
    const size = fittedSize(measure(widest), viewport());
    word.style.fontSize = `${size}px`;
  }

  // The only write to the field, and it only ever writes a word: a blank frame
  // between two words would make the layer a 3.67 Hz full-contrast flicker.
  function show(index: number): void {
    const text = words[index];
    if (text === undefined) return;
    word.textContent = text;
  }

  function retire(): void {
    retired = true;
    word.remove();
  }

  return { element, fit, show, retire };
}

export function followViewport(field: WordField): () => void {
  const refit = () => field.fit();
  field.fit();
  void document.fonts.ready.then(refit);
  window.addEventListener('resize', refit);
  return () => window.removeEventListener('resize', refit);
}

function viewport(): Viewport {
  return { width: window.innerWidth, height: window.innerHeight };
}

function createWord(): HTMLElement {
  const element = document.createElement('div');
  element.className = 'word';
  return element;
}

function createSample(): HTMLElement {
  const element = document.createElement('div');
  element.className = 'word word--sample';
  element.style.fontSize = `${SAMPLE_SIZE}px`;
  return element;
}
