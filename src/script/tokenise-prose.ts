const WHITESPACE = /\s+/;
const EDGE_PUNCTUATION = /^\p{P}+|\p{P}+$/gu;

export function tokeniseProse(prose: string): string[] {
  const words: string[] = [];
  for (const token of prose.split(WHITESPACE)) {
    const word = token.replace(EDGE_PUNCTUATION, '');
    if (word) words.push(word);
  }
  return words;
}
