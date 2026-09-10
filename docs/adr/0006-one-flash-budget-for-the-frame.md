# One flash budget for the frame

Four things on screen move on their own: the word, the photograph under it, the
spiral between them, and the depth that spiral is drawn at. Each was bounded
when it was built, and each bound was argued from the same place — how often the
frame may change its luminance — so that argument is now written out four times,
in two files, as four unrelated limits. It is one limit.

The frame changes luminance no faster than **0.5 Hz**. That is a sixth of the
three flashes a second the photosensitivity literature draws its line at, and
the distance is the point: a session is watched unblinking, in the dark, by
someone who has agreed in advance not to look away. The app holds itself far
under the threshold rather than near it.

The ceiling is not divided evenly. The layers are ordered under it, each a clear
step below the one above:

- **The imagery spends the whole of it.** A new photograph replaces every pixel
  at once, so it is the only layer that can reach the ceiling — 0.46 Hz at the
  default pace of 220 words a minute, 0.5 Hz at the pace ceiling of 240. This is
  what `pace` is bounded at 240 for. That bound is the imagery's, not the word
  layer's, because the image slot is counted in words.
- **The spiral spends 0.2 Hz**: one arm passing a point at 12 turns a minute. A
  pair spends that between them, since a point is passed as often either way
  round. It was 0.4 Hz on two arms; ADR 0008 dropped the second arm and left the
  rate bound where it was, spending the freed room on the size of each change
  rather than on more of them.
- **The swell spends 0.1 Hz**, half the spiral's, and it moves part of
  the depth rather than the whole frame.
- **The word layer spends none of it.** At 240 words a minute a word changes at
  4 Hz, over the threshold, and it costs nothing: the change is a glyph, not the
  frame. Same colour, same ground, same place, and never a blank frame between
  two words. The word layer is fast in a currency this budget is not counted in.

A session says nothing about any of it. No notice before the start gesture, no
Hz on screen, no setting. The budget is spent at authoring time or not at all: a
script that would cross it is refused with a finding naming the bound, and the
app's own geometry is fixed under it. The person who plays a session is the
person who wrote it and who chose every photograph the library holds — there is
no second party to warn, and a warning about what the app will not let happen
would be the first screen that talks to the user about the app instead of
running the session.

## Considered Options

- **A photosensitivity notice before the session** — rejected. It is the
  ordinary thing to ship, and it is ordinary because most apps show content
  whose rate they do not control. This one controls every rate it draws, bounds
  every rate a script may ask for, and refuses the script rather than clamping
  it. A notice would name a risk the app has already spent four bounds removing,
  and it would open the session with a screen — which is the one thing the hold,
  the gate and the start gesture were each shaped to avoid.
- **The ceiling at the flash threshold itself, 3 Hz** — rejected. It would let
  the imagery run six times faster and the spiral seven, and it would put the
  word layer's 4 Hz inside the budget instead of outside it. A threshold is
  where harm begins, not where a session should sit.
- **An even split, each moving layer a quarter of the ceiling** — rejected. It
  reads fair and it makes four rhythms the same size, which is exactly what the
  frame must not have. It would also put the imagery at an eighth of what it
  runs at, for the sake of a sum the layers do not make: a photograph changes
  the whole frame, a spiral a fraction of it, a swell a fraction of that. What
  matters is that no two of them are the same size, not what they total.
- **One constant in code that the bounds are computed from** — rejected. It is
  what "one place" usually means, and here it would lie. The bounds are not the
  ceiling divided; they are what each layer's own arithmetic — eight words to an
  image, one arm to a turn, one pass out and back — happens to make near it,
  and a shared constant would have to be walked back through three different
  derivations to arrive at 8, 12 and 10. The numbers stay where they are read.
  What is shared is the reason.

## Consequences

- No bound moves. `WORDS_PER_IMAGE` is 8, `PACE_HIGH` 240, `RATE_HIGH` 12 and
  `SWELL_LOW` 10, and each comment now names its layer's share and points here
  instead of arguing the ceiling again.
- A new moving layer arrives with its question already asked: what does it
  spend, and is that a clear step away from the imagery's 0.5, the spiral's 0.4
  and the swell's 0.1? A layer wanting a share already taken is a layer that
  changes this decision rather than inheriting it.
- ADR 0003 derived the spiral's rate from the imagery's, and ADR 0004 bounded a
  pair by what one spiral may turn. Both readings still hold. The derivation now
  lives here, and those are consequences of it.
- `docs/script-format.md` keeps telling the author why each bound sits where it
  does, in the words the finding uses. That is not a second decision; it is this
  one, said where the author is already looking.
- The budget is kept in two places and shown in neither: the findings, which
  speak to the author before a session exists, and the app's geometry, which
  nobody declares. A layer whose rate the app cannot bound — anything driven by
  the content of a file rather than by a declaration — reopens the notice, since
  the budget would stop being a promise the app can keep.
