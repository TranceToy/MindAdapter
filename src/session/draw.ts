// The chance a session runs on, passed in rather than reached for, so every
// draw a session makes — the clips it hears, the order its segments come in —
// is one a test can write out in full.
export type Roll = () => number;

// Keyed and sorted rather than swapped in place, so the roll is spent once per
// place and a test can read the order it asked for off the keys it wrote.
export function shuffled<T>(held: T[], roll: Roll): T[] {
  const keyed = held.map((one) => ({ one, key: roll() }));
  keyed.sort((one, other) => one.key - other.key);
  return keyed.map((pair) => pair.one);
}

// The seam between one draw and the next is the only place a draw can repeat
// itself, and trading the repeated head for one taken from the rest of the
// order is a re-draw that cannot fail to break the repeat.
export function unseamed<T>(drawn: T[], last: T | null, roll: Roll): T[] {
  if (drawn.length < 2) return drawn;
  if (drawn[0] !== last) return drawn;
  const place = 1 + Math.floor(roll() * (drawn.length - 1));
  const head = drawn[0];
  const taken = drawn[place];
  if (!head || !taken) return drawn;
  drawn[0] = taken;
  drawn[place] = head;
  return drawn;
}
