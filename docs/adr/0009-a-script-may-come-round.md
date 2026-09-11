# A script may come round

A session was one run of a script and then a hold: the last image on screen in
silence until the user left it. That is the right ending for a script written to
end, and the wrong one for the thing a lot of this app is used for — a short
passage meant to be heard over and over, which under the old shape had to be
written out twenty times or restarted by hand twenty times, neither of which the
person in the session is in a state to do.

So: **a script may declare `loop: yes`, and a looping session runs the script
round after round until the exit gesture.** The first word follows the last on
the next beat. There is no hold in a looping session, and no screen at the seam.

## Considered Options

- **A count — `loop: 3`** — rejected. Three rounds is a longer script, which the
  author can already write, and the number would be a duration in disguise: an
  author who wants forty minutes wants forty minutes, not a division they have
  to do against a round length the app computes for them. Once the exit gesture
  is the way out either way, the count buys nothing.
- **A control in the app — a loop toggle on the start screen** — rejected by
  ADR 0001's line and by the format's: nothing about a session is set in the
  app. Whether a script bears repeating is something its author knows and its
  reader, mid-session, cannot act on.
- **A fade or a beat of silence at the seam** — rejected. Every other boundary
  in a session is crossed without an event — a bed pair glides, a rate changes
  speed without jumping, a photograph is replaced rather than faded — and a seam
  that announced itself would be the one edit the app made to the writing.
- **Restarting the session at the seam: tearing the layers down and starting
  them again** — rejected. It is the obvious implementation and the wrong shape:
  the spiral's angle and the voice's cadence would snap back to their openings,
  and the app would have a second, quieter kind of beginning that the rest of
  the code knows nothing about.

## Consequences

- The session clock keeps running; what comes round is the reading of it. A
  round is a length, `roundAt` maps a second of the session to a round and a
  second inside it, and every layer takes the coordinate it needs from there.
  Nothing in a layer knows about a seam except the three that write into the
  audio clock ahead of the words.
- The words are the one layer that reads the round's second rather than the
  session's, which is the whole of the loop: the cue that would have been the
  word past the last is the first word of the round after it, and the ending the
  word layer used to fire never fires.
- The bed, the voice and the snaps schedule ahead in absolute audio time and so
  cannot be written once for a session with no last round. They are armed a
  round at a time, each round while the one before it is still running, so a
  sound landing on the first beat of a round is already scheduled by the time
  the words reach it.
- The spiral's angle and the depth's swell carry across the seam, for the reason
  ADR 0004 and the format already give for carrying them across a change of
  rate: a jump is the one thing the layer may not do. The head's rate is a rate
  change like any other.
- The voice's deadline — no clip started that would still be speaking after the
  last word — is a rule about a last word, so a looping script has none. A
  suggestion may run over the seam, and the silence it owes is carried into the
  round after it, which keeps "clips never overlap" true without a gap at every
  seam.
- A session now has two endings rather than three, both of them gestures. The
  start screen says so before the Start, beside the windowed and mono lines, for
  the same reason those are said there: it changes how the session is left.
- The selection screen shows one round's length and that the script is looped. A
  looping session has no duration to name.
