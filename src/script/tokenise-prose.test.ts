import { describe, expect, it } from 'vitest';
import { tokeniseProse } from './tokenise-prose';

describe('tokeniseProse', () => {
  it('strips punctuation from both ends and leaves interior marks', () => {
    const words = tokeniseProse('effort. "warm," don\'t half-asleep');
    expect(words).toEqual(['effort', 'warm', "don't", 'half-asleep']);
  });

  it('drops tokens that reduce to nothing', () => {
    const words = tokeniseProse('sinking — slowly … now');
    expect(words).toEqual(['sinking', 'slowly', 'now']);
  });

  it('treats newlines and blank lines as ordinary whitespace', () => {
    const words = tokeniseProse('  the water\n\nis   heavy\n');
    expect(words).toEqual(['the', 'water', 'is', 'heavy']);
  });
});
