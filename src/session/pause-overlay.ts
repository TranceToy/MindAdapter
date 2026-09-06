import { actionHero, dimActionHero, prose } from '../shell/antechamber';
import { END_LINE, MONO_OUTPUT_WARNING, RESUME_LINE } from './session-copy';

export type ResumeSession = () => void;

export type EndSession = () => void;

// Resume lit and End dim: a pause is frequent and usually benign while a stop
// keeps nothing, so equal weight would put the irreversible one at the same
// visual value in front of someone interrupted mid-trance. The overlay says
// nothing about which of the three triggers fired, and its one conditional line
// is the mono warning, which earns its place by saying something no ear can
// infer.
export function renderPause(resume: ResumeSession, end: EndSession, mono: boolean): HTMLElement {
  const lit = actionHero(RESUME_LINE, resume);
  const dim = dimActionHero(END_LINE, end);
  const resumeWord = haloWord(lit);
  const endWord = haloWord(dim);
  const content = document.createElement('div');
  content.className = 'pause__content';
  content.append(resumeWord, endWord);
  if (mono) {
    const warning = renderWarning();
    content.append(warning);
  }
  const overlay = document.createElement('section');
  overlay.className = 'pause';
  overlay.append(content);
  return overlay;
}

function haloWord(word: HTMLElement): HTMLElement {
  word.classList.add('pause__word');
  return word;
}

function renderWarning(): HTMLElement {
  const line = prose(MONO_OUTPUT_WARNING);
  line.classList.add('pause__mono');
  return line;
}
