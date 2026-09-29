# The look of the loop

The voice the scripts are written in has a reference video, and the session did
not look like it. Measured frame by frame, the video's spiral is two arms, not
three, winding out logarithmically: each band crossing a ray lies about 1.75
times further out than the one inside it, so the bands widen and part toward the
edge and the centre is a dark point they pour out of. The lit band is narrow —
about a seventh of the gap — with a soft glow falling off into a pure black
ground, and it is a jade that leans blue, `#39fed2`. The words are bold Arial in
jade, `#42f0b6`, with a darker jade, `#106246`, for what is set back.

So the session takes that look. **Two arms on a logarithmic spiral, a narrow
glowing band on pure black, the centre faded to ground; jade words in a bold
grotesk; the mark in the near white.**

- The arms are filled outlines rather than strokes, since a band that widens
  with its radius has no one stroke width. Each arm carries a dark band a little
  over half the step between crossings, so the two arms' dark bands overlap and
  cover the photograph as the one arm's did.
- The glow is two wider, fainter bands of the same jade under the core, not a
  blur: it is drawn once and turns with the arms at no cost per frame.
- The centre, where a logarithmic arm has no end, is covered by a still disc
  that fades from ground to clear.
- The face is Liberation Sans Bold, which has Arial's metrics and ships under a
  licence the app can bundle.
- The words are jade, so the mark, which is a colour and nothing else, takes the
  near white the words had. It is brighter than the words, so it cannot be read
  as them going dim.

## Considered Options

- **Keeping three Archimedean arms and only recolouring them** — rejected. The
  widening bands and the dark centre are most of what the video's spiral looks
  like; the colour is the smaller part.
- **A blur filter for the glow** — rejected. A filter on a turning drawing is
  recomputed every frame.
- **A gold mark** — rejected again for ADR 0011's reason. The video's gold is a
  play button, not a word.

## Consequences

- `RATE_HIGH` stays 40. Two arms passing a point at 40 turns a minute is
  1.33 Hz, under the 2 Hz ceiling of ADR 0013 rather than at it.
- The video's spiral flows outward at about 11 turns a minute; in the app that
  is a rate of `-11`. A positive rate flows inward, as it did before.
- ADR 0011's palette moves: the ground is `#000000`, the words `#42f0b6`, the
  spiral `#39fed2`, the mark `#e6fff3`, the dim text `#106246`.
