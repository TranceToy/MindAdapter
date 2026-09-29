# Jade on black

_The ground is pure black, the words are jade and the mark is the near white;
the spiral's jade leans blue. See ADR 0014._

The app's palette was black ground, white words, an amber mark, and a spiral
whose lit band was white — chosen for contrast and for nothing else. The scripts
the app now plays are written in one voice, and that voice has a look: black and
jade, a green ring of light turning behind her. A session that plays her words
over her imagery in white and amber is dressed as something else.

So the palette is **jade on black.** The ground is a black with green in it. The
words are a white with green in it, near enough to white to keep their full
legibility over a photograph. The mark and the spiral's lit band are jade, the
one saturated colour the app has, so the two things a script can point at — a
word it marks and a spiral it declares — are the two things drawn in it.

## Considered Options

- **A mint band, near white** — rejected. It keeps almost all of the step ADR
  0008 asks for, and in keeping it reads as white: the ring the look is built
  round does not appear.
- **A gold mark** — rejected. Gold is in the look as an accent, but a third hue
  in a palette of two dilutes both, and jade holds its hue against a photograph
  for the same reason amber did: it is saturated, so it cannot be read as the
  word colour going dim.
- **A palette a script can choose** — rejected for the reason ADR 0005 gives: a
  script that could name a colour could name an unreadable one. The palette stays
  the app's, one decision made once; this ADR is that decision made again.

## Consequences

- ADR 0008's pass is no longer the frame's full step. The lit band is jade, not
  white, so a pass is the step from black to jade — smaller, and smaller still
  over a bright photograph. The one-armed shape, the dark band of twice the
  width and the doubled turns all stand; only the top of the step moves.
- The flash budget of ADR 0006 is unchanged. It bounds how often the frame's
  luminance changes, and nothing here makes it change more often. What shrinks
  is the size of each change, which moves away from the flash threshold, not
  toward it. Green is not the saturated red the photosensitivity guidance
  singles out.
- ADR 0005's amber is jade. Everything else about a mark stands: the colour is
  the whole of it, the same face at the same size on the same beat.
- `CONTEXT.md` and `docs/script-format.md` stop saying white where they meant
  the word colour or the top of the spiral's step.
