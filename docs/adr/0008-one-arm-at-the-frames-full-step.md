# One arm, at the frame's full step

The spiral was two arms of white line at the depth a script declared, and what
it drew was a light band over whatever the photograph showed underneath. Two
things follow from that and both weaken the pull: the eye is given two bands
meeting at the centre and picks between them instead of following one in, and
the contrast of a pass is not the spiral's to set — a band over a bright part of
a photograph is barely a band at all.

So: **one arm, and the arm carries its own dark.** The lit band is drawn on a
band of ground twice its width, so the two tile the plane between them and what
passes over any point is the whole step from black to white rather than a fifth
of one. The turns double, six to twelve, so the bands are exactly as wide as
they were and only the topology and the contrast change.

## Considered Options

- **One arm, unchanged white line** — rejected. It fixes the meeting at the
  centre and leaves the pass as faint as it was, over a photograph whose
  brightness the spiral does not control.
- **More contrast by opacity alone** — rejected. Depth already does that, and it
  is the script's. Pushing the depth up to be seen makes every spiral a veil,
  which is the one thing depth exists to let an author choose against.
- **A scrim or a blend mode under the arms** — rejected by the session's
  language, which has refused effects everywhere else: no vignette, no blur, no
  fade. A dark band is geometry, drawn the same way the lit one is.
- **Keeping two arms and darkening between them** — rejected. It doubles the
  dark the pair already knots at the centre, and the reason for two arms was
  never argued from what the eye follows.

## Consequences

- ADR 0004 fixed the shape at two arms and rejected changing it; that part is
  superseded here. The rest of 0004 stands untouched: a script may still declare
  a pair, each with its own rate, sign, depth and angle.
- The spiral's share of the flash budget halves. One arm passes a point once a
  turn, so 12 turns a minute is **0.2 Hz**, not the 0.4 ADR 0006 names — still a
  clear step under the imagery's 0.5 and above the swell's 0.1. `RATE_HIGH`
  stays at 12: the bound is what a script may ask for, and nothing is gained by
  letting a session turn faster than it could yesterday.
- What halves in rate doubles in depth of contrast. A pass is now the frame's
  full step at depth 1, where it used to be a light band over an image. The
  budget bounds how often the frame may change, and this decision makes each of
  those changes as large as it can be — which is the point of it, and the reason
  the rate is left where it is rather than raised into the room the arm freed.
- Two spirals over one photograph read differently: at full depth the upper
  one's dark band covers the lower rather than adding to it. A pair is written
  at the depths that let both be seen, as it always was, but the depths that do
  that are lower than they were.
- `docs/script-format.md` and `CONTEXT.md` say one arm and 0.2 Hz where they
  said two and 0.4.
