# Writing a script

`script-format.md` says what a script may contain. This says what to put there.
A script that parses is not yet a script that works: every finding can be absent
and the session still be shapeless, too fast to sink into, or over before the
words have done anything.

## The arithmetic an author works in

A script is written in words, but it is played in seconds. Four numbers convert
between them, and nothing in the app will do it for you mid-session.

- **A segment lasts its word count divided by its pace.** 600 words at 120 is
  five minutes; the same 600 at 220 is under three. Write to a length by
  counting words, not by counting paragraphs.
- **A photograph lands every eight words** — every 2.2 seconds at 220, every
  4 at 120, every 12 at the floor of 40. Pace is the imagery's speed as much as
  the words'.
- **A suggestion lands every clip-length plus gap.** Four-second clips under the
  default `7-15` speak roughly four times a minute. Halve the gap and the voice
  crowds the words; take it to 60 and a ten-minute segment holds perhaps eight
  suggestions.
- **A spiral turns once every 60/rate seconds.** At 3 that is a turn every 20
  seconds; at 0.5, one every two minutes, which reads as drift rather than
  turning.

## Shape the session, not the paragraph

A segment is a change, not a chapter. Open a new one when something about the
session should differ — the pace drops, the imagery moves, the voice starts or
stops — and let prose run on inside it rather than breaking it up for the look
of the file. Line breaks mean nothing to the reading.

Four movements carry most sessions, and each is usually one or two segments:

1. **Arrival.** Near the top of the pace range, imagery the eye can follow, no
   spiral yet, voice silent or sparse. The point is to be followed easily.
2. **Descent.** Pace steps down — 200, then 160, then 120 — one step per
   segment. The imagery slows with it because the eight-word slot is measured
   in words. This is where a spiral earns its place.
3. **The floor.** The slowest pace of the session, held longest, with the voice
   at its densest and the imagery narrowed to one or two pools. Everything that
   the session is for is said here.
4. **Return.** Pace back up, spiral stopped, voice silenced, imagery bright.
   The last words should be words the session can end on, because the hold that
   follows is a photograph and silence, indefinitely.

Never end at the floor. A script whose last segment is its slowest leaves the
session to the user's exit gesture rather than to the writing.

Unless it loops. A looping script has no end to write, and the four movements
are the wrong shape for one: a return that brings the pace back up hands
straight over to an arrival that is already awake, and the session climbs out
of the floor once a round for no reason. Write a looping script as a circle
instead — see below.

## The words themselves

One word per beat, punctuation stripped, every word held exactly as long as
every other. That single fact governs the prose:

- **Short, concrete words read; long ones stall.** "Heavy" costs one beat and so
  does "consequently". Weight the sentences toward words that carry an image.
- **Punctuation does no work.** Commas and full stops vanish before the words
  are shown, so the rhythm is the pace and the pace alone. Build cadence from
  word count — short runs, then longer ones — not from commas.
- **Write what is, in the present tense, in the second person.** "Your arms are
  heavy" plays; "you will begin to feel that your arms may be getting heavier"
  spends nine beats before it says anything.
- **Say what to do, not what not to do.** A negation is read one word at a time,
  and the word that carries the image lands before the word that cancels it.
- **Repeat deliberately.** Repetition is the mechanism, not a flaw in the draft.
  A phrase that returns at the same pace three segments apart is heard as
  structure; a phrase varied each time is heard as new information.
- **Chain from the true to the intended.** Words the session can verify —
  breathing, the weight of the chair, the turning on screen — carry the ones it
  cannot. Open a segment with the verifiable and close it with the intended.
- **Avoid numerals and abbreviations.** They tokenise oddly and read as
  instructions to think rather than words to follow. Write counts as words.
- **Mark the few words the session turns on.** `*heavy*` is the one colour a
  session has and the one sound it snaps, and it works by being rare: a handful
  of trigger words across a whole script reads as the session pointing at
  something, while a marked word every other line reads as a second voice
  running under the prose — and now sounds like one, since every marked word is
  struck. Mark the same word every time it returns, so the colour is heard as
  the same instruction rather than as this one occurrence being different.

## Writing a script that comes round

`loop: yes` in the head makes the script a round rather than a session. The
first word follows the last on the next beat and nothing resets, so what the
seam sounds like is entirely the author's: the last words of the script are
heard immediately before the first, every round, for as long as the session
runs.

- **Write the seam as a join, not as an ending.** Read the last three lines and
  the first three as one passage, because that is what they are. A script whose
  last segment returns — pace up, voice silent, imagery bright — reads as a
  session ending and then starting again, once a round.
- **Keep the pace and the bed level across the seam.** The last segment's pace
  is the one the first segment's pace steps from. A round that ends at 120 and
  opens at 220 is a jolt on every lap; ending and opening at the same number
  makes the seam inaudible.
- **Drop the arrival and the return.** A looping script is usually descent and
  floor alone: the arrival is only needed once, and a session that loops gets it
  from the first round. What the later rounds want is the floor coming round
  again, not a fresh introduction.
- **Length is the whole of the repetition.** A three-minute round is heard twenty
  times in an hour and every phrase in it is heard twenty times; a twenty-minute
  round is heard three. Write short rounds for a session that drills a handful
  of suggestions and long ones for a session that wanders.
- **Say the marked words once a round, not once a script.** A marked word is
  rare by the round it sits in, and a looping session multiplies whatever the
  round holds.
- **A swell crosses the seam on the session's clock**, not the round's, so its
  period is chosen against how long the session will run rather than against the
  round. A period close to the round's length makes every round breathe the same
  way; a period unrelated to it makes no two rounds alike.
- **Say where the session ends, because the script does not.** A looping session
  is left by the exit gesture and nothing else. The start screen says so before
  the Start.

## Setting the other layers

**Imagery.** Tags are a flat union: a 200-file pool named beside a 5-file pool
makes one 205-file draw, and the small pool is all but unseen. Name pools of
comparable size together, or name the small one alone in a segment of its own.
A segment header is the whole truth about what is on screen — nothing inherits —
so write every header, including a bare `#` where the field should be blank.

**Voice.** The gap is drawn where the silence begins, so changing only `gap`
never interrupts what is speaking. Use `voice:` to silence the layer for arrival
and return, and let the floor segment carry the tags that matter. Clips that run
long want a shorter gap than clips that are a sentence each; measure a few
before choosing bounds.

**Bed.** One pair for the whole session is the common case. Where it changes, it
glides on the first word of the segment, so put the change on the segment that
also changes the pace, not on one of its own.

**Spiral.** It is opt-in, and a session with no spiral is a complete session.
Where it is used, one spiral at a low rate and a shallow depth under the descent
does more than a fast one — the depth defaults to a fifteenth for a reason, and
anything above about a sixth starts taking the photograph rather than sitting
over it, since the arm carries its own dark band and covers what it passes over.
A pair turning against each other belongs at the floor, where there is
nothing left to introduce. A swell is measured from the start of the session, so
its period is chosen against the whole length, not against the segment; a period
near the length of a segment makes the segment breathe once.

## Before playing it

- Total words divided by pace: is the session the length it was meant to be?
- Does the last segment return — pace up, spiral stopped, voice silent? Or,
  where it loops, does the last line read straight into the first?
- Does every segment header name pools that exist and hold files?
- Is anything said only once that should have been said three times?
- Are the marked words few enough to be heard, and marked every time?
- Are there long words where the beat needs a short one?
