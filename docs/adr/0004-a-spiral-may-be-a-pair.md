# A spiral may be a pair

_The shape this decision holds fixed at two arms is now one arm carrying its own
dark band; see ADR 0008. Everything below about a pair — two rates, two signs,
two depths, two angles — still holds._

The session's language refuses effects: no scrim over the photograph, no blur
behind the pause, no vignette, no fade between one image and the next. What it
has instead is geometry the app draws and a script turns. So the way to deepen
the pull is not a filter but more of that geometry, and the one addition that
earns its paint is a second spiral turning against the first.

A rate below zero already turns a spiral the other way. That leaves nothing to
invent: a counter-spiral is a second spiral with the other sign, and the whole
change is that `spiral:` holds a list rather than a value. One or two, separated
by a comma, each with its own rate and its own depth.

```
spiral: 3, -1/0.06
```

## Considered Options

- **A `counter:` key of its own** — rejected. It would make the second spiral a
  different kind of thing from the first, needing its own inheritance and its
  own stop, and it would have no answer at all for two spirals turning the same
  way at different rates.
- **Counter-rotation inside one spiral, half its arms each way** — rejected. The
  arms are the spiral's shape and the shape is the app's, fixed at two because
  every arm ends at the centre and a third knots it. Turning half of them
  against the other half makes that knot on purpose.
- **Three or more** — rejected. What they turn between them is bounded, so a
  third leaves each of them too slow to read as turning, and all of them still
  meet at the centre.
- **Bounding each spiral by the full ceiling rather than the pair** — rejected.
  Two two-armed spirals at 12 turns a minute pass a point at 0.8 Hz, twice what
  the layer was held under, and above the rate the imagery layer already runs
  at.

## Consequences

- A session is still four layers plus a spiral. The spiral layer turns one
  spiral or two; nothing else about the session's shape moves.
- What a segment holds is a list, so the stop that used to be nothing is now a
  list of none. Declaring `spiral:` still stops the turning; declaring nothing
  still inherits it.
- A spiral is told from its fellow by nothing but its place in the declaration.
  That is what carries the angles: a segment that drops the second spiral and a
  later one that takes it up again take it up where it stopped, exactly as a
  lone spiral resumes after a stop.
- The ceiling on turning is a property of the frame rather than of a spiral. Two
  rules stand where one did: each spiral turns between 0.5 and 12 turns a
  minute, and a pair turns no more than 12 between them.
- The depth moves off the layer and onto each spiral. The box the arms turn in
  is shared, so the opacity a depth becomes now rides the arms themselves, and
  the arms of a spiral that is not turning are taken out of the paint rather
  than left at nothing.
