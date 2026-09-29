# Three arms at two hertz

_The three arms are two, winding out logarithmically; see ADR 0014. At the
same `RATE_HIGH` of 40 the spiral now spends 1.33 Hz of the 2 Hz ceiling._

The spiral still read as slow at 24 turns a minute, and one wide arm left the
frame sparse. More arms and more speed both spend the flash budget, and ADR
0006's half-hertz ceiling had no room for either: three arms at 24 turns a
minute already pass a point at 1.2 Hz.

So: **the frame's ceiling is 2 Hz, and the spiral spends it.** Three arms over
eight turns, each band half as wide as the one arm's, and `RATE_HIGH` 40 —
three arms passing a point at 40 turns a minute is 2 Hz. That is two thirds of
the 3 Hz flash threshold rather than a sixth of it: nearer, and still under.

## Considered Options

- **Keeping the 0.5 Hz ceiling** — rejected. Three arms under it would turn at
  10 turns a minute, slower than one did, which is the opposite of what was
  asked.
- **A ceiling at the threshold, 3 Hz** — rejected. A session is watched
  unblinking in the dark, and a bound set at the threshold is where harm begins.
- **Two arms** — rejected as too few for the density asked for; four would put
  40 turns a minute at 2.7 Hz.

## Consequences

- The spiral spends more than the imagery, which ADR 0006 ordered the other way.
  The imagery keeps its 0.5 Hz and the swell its 0.1; no two are the same size.
- The centre is a meeting of three arms again, which ADR 0008 moved away from.
  The density is chosen over the single point.
- A pair is bounded at 40 between them, as one alone is.
- `docs/script-format.md` and `CONTEXT.md` say three arms, 40 and 2 Hz.
