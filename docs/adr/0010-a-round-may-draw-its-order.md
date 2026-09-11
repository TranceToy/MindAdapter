# A round may draw its order

A script was played in the order it was written, once (ADR 0009 made it round
after round). For a script written as an arc that is the only order there is. For
the thing a looping session mostly is — a floor of three or five interchangeable
segments, heard for an hour — the written order is an accident of the file that
the session then repeats forty times, and the person in it starts hearing the
order rather than the words: the next segment is known before it arrives, and a
suggestion heard in the same place every round stops being heard at all.

So: **a script may declare `shuffle: yes`, and every round of it draws the order
its segments come in.** Every segment is played once a round, the round is
exactly as long as it was, and no segment opens the round after the one it
closed.

## Considered Options

- **Drawing once per session rather than once per round** — rejected. It is a
  line of code against this one's spread through every layer, and it buys almost
  nothing where the declaration is aimed: a looping session would play one drawn
  order for an hour, which is the same session the author could have written by
  hand. Variety between sessions was never the complaint.
- **Resolving declarations after the draw, so a segment inherits from the
  segment drawn before it** — rejected, and this is the decision the rest of the
  change rests on. A round's length would then depend on the order it drew, and
  a round is a length: the selection screen names it, the seam is counted by it,
  the bed and the snaps are armed a round ahead by it, the swell is measured
  along it. Resolving where the author wrote — so a segment's pace, bed, voice,
  gap and spiral travel with it — makes a round the same word counts at the same
  paces summed another way round, and every one of those readings survives
  untouched.
- **A drawn order that may repeat a segment across the seam** — rejected for the
  reason the clip bag already gives for its own seam: the one thing chance must
  not be allowed to do is say the same thing twice running, which reads as a
  malfunction rather than as chance. The seam is re-drawn there, by the same
  trade the bag makes.
- **Shuffling stretches inside a segment, or drawing a subset of the segments
  each round** — rejected. Both are a second kind of writing the author cannot
  see in the file: a segment is the unit the format exposes, and a round that
  played four of six segments would make the selection screen's length a lie.
- **A control in the app — a shuffle toggle on the start screen** — rejected by
  ADR 0001's line and ADR 0009's: nothing about a session is set in the app.
  Whether a script's segments are interchangeable is something only its author
  knows.

## Consequences

- The order is drawn once, in the session step, and handed to every layer as the
  one thing they all read a round through. A layer no longer holds `Segment[]`;
  it asks the order for the round it is scheduling, which is where a shuffled
  script draws. Nothing in a layer knows whether the order it got was drawn or
  written.
- The schedules that were built once for a session are built once for a round.
  The three that were already armed a round at a time — bed, voice, snaps —
  change almost nothing; the three that read every frame — words, imagery,
  spiral — hold their round's schedule until the round after it, so a frame still
  costs a lookup.
- The words are handed the word to show rather than its place, because a place no
  longer names a word: the same index holds a different word in one round and the
  next. The field is still fitted to the widest word the session can hold, which
  does not change with order.
- The spiral's carried angle is still one set of numbers for the whole session.
  What a place sweeps across a round is its rate times its seconds summed over
  the segments declaring it, and a sum does not care about order — so a shuffled
  round hands the round after it the same angle the written one would, and the
  swell goes on reading the session's own clock.
- The chance a session runs on is now one thing: the shuffle and the re-drawn
  seam the clip bag was already using are shared, and both take their roll from
  the caller rather than reaching for `Math.random` — so an order, like a bag,
  can be written out in a test.
- `shuffle` is the second head-only declaration, and the two are read and refused
  the same way: one of two words, in the head, or a finding.
- The selection screen says nothing new. A drawn order changes neither the length
  of a round nor the way the session ends, and a row that announced it would be
  telling the user something they cannot act on.
