const WHITESPACE = /\s+/;
const EDGE_PUNCTUATION = /^\p{P}+|\p{P}+$/gu;
const MARK = '*';
const PAIR = 2;

// What the word layer is handed for one beat: the text it shows, and whether a
// script set that word apart to be shown in the marked colour.
export type Word = {
  text: string;
  marked: boolean;
};

type ReadWord = {
  word: Word | null;
  marking: boolean;
};

// Marks are read before punctuation is stripped, because the mark is
// punctuation itself and would otherwise vanish with the quotes and stops
// around it. Every mark turns the marking over: the first opens a run and the
// next closes it, so a lone marked word is a run of one and a word carrying
// both is closed where it opened. A run left open runs to the end of the
// segment — prose is tokenised a segment at a time, so a mark can never cross
// into the next one.
export function tokeniseProse(prose: string): Word[] {
  const words: Word[] = [];
  let marking = false;
  for (const token of prose.split(WHITESPACE)) {
    const read = readWord(token, marking);
    marking = read.marking;
    if (read.word) words.push(read.word);
  }
  return words;
}

function readWord(token: string, marking: boolean): ReadWord {
  const marks = countMarks(token);
  const text = strip(token.replaceAll(MARK, ''));
  const marked = marking || marks > 0;
  const held = marks % PAIR === 0 ? marking : !marking;
  if (!text) return { word: null, marking: held };
  const word: Word = { text, marked };
  return { word, marking: held };
}

function countMarks(token: string): number {
  let marks = 0;
  for (const character of token) {
    if (character === MARK) marks += 1;
  }
  return marks;
}

function strip(token: string): string {
  return token.replace(EDGE_PUNCTUATION, '');
}
