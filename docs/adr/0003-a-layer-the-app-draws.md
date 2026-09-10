# A layer the app draws

_The ceiling this decision derives the spiral's rate from is now stated once, as
the frame's flash budget, in ADR 0006. The derivation below still holds; it is a
consequence of that budget rather than the place it is decided._

Every layer a session runs came out of the library: the words and structure a
script declares, the photographs of a pool, the clips of another, and a bed
generated from two numbers a script names. The spiral is the first that comes
out of none of it. It is geometry — arms, a radius, a rate — and there is no
file a user could put in a folder that would make it, so it is drawn by the app
and only turned by the script.

That makes it the one layer a session can run without. The other four are always
there: a script that declares no bed runs on a default pair, one that declares no
pace runs at 220, one that names no voice tags is silent but the layer is still
mounted. A spiral has no default, because a spiral no one asked for is not a
quieter session but a different one. So `spiral:` is opt-in, and every script
written before it plays exactly as it did.

## Considered Options

- **A fourth pool, `spirals/`** — rejected. It would put the shape in the
  library, where a user could vary it, at the cost of a fourth folder, a scan
  path, an index shape and a decode on every draw — all to supply an image that
  is the same image every time. The library is for what only the user can
  provide.
- **A spiral in every session, tuned by declaration** — rejected. It would
  change what every existing script plays, and it would make the app's own
  geometry the one thing on screen a script could not remove.
- **Rotation derived from the bed's beat frequency** — rejected. It reads well
  — one entrainment, two layers — but it welds the spiral's rate to a range
  chosen for hearing, and leaves an author who wants a slower spiral under a
  faster beat with nothing to say.

## Consequences

- A session is four layers plus a spiral, not five layers. ADR 0001 describes
  the four the platform choice was made for, and that reading still holds: the
  spiral needs no scheduling the word layer did not already need, and nothing
  about it would have been decided differently.
- The spiral's rate is bounded by the imagery layer rather than the word layer.
  One arm at the ceiling of 12 turns a minute passes a point at 0.2 Hz — 0.4 Hz
  when this was written, two arms ago; see ADR 0008 — under the 0.46 Hz a new
  photograph every eight words already makes. The word
  layer's own 3.67 Hz is nowhere near it, and nothing on screen may approach it
  twice.
- A declaration can now mean nothing rather than be absent. `spiral:` stops the
  spiral where an absent `spiral` inherits it, so the resolution reads that one
  key with a branch instead of the `??` the other three use.
- The turning is a schedule, like the bed's and the imagery's: rates land on the
  beat of the first word of the segment declaring them, and the angle is carried
  across, so a change of rate is a change of speed and a stop leaves the angle
  for a later rate to take up.
- The spiral stands still for the hold. The session ends as a frame going quiet,
  and a layer still turning over it would be the only thing left moving.
