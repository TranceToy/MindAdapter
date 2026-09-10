# The script format

A script is the one file an author writes. It supplies a session's words and its
segment structure, and from its declarations the other layers — imagery, voice,
bed and spiral — take everything they play. Nothing about a session is set in the
app: what is not declared runs on a default, and what is declared is played as
written or not played at all.

Scripts live in the library, in `scripts/`, as `.md` or `.txt` files. The file
name without its extension is the name the selection screen lists.

What the format allows is below; what to do with it is in
`writing-scripts.md`, beside it.

```
<library>/
  scripts/    the scripts
  images/     one folder per image pool, named by its tag
  clips/      one folder per voice pool, named by its tag
```

## The whole of it

```
bed: 141.5/7.83
voice: obedience
pace: 200
gap: 9-18
spiral: 3, -1/0.06

# ocean, deep water

The water is warm and *heavy* on your skin. Nothing to hold, nothing
to hold on to.

# void
bed: 140/4
pace: 120
gap: 25
spiral: -1.5/0.1-0.4/40

Nothing above you. Nothing below.

# surface
voice:
pace: 220
spiral:

Up, and awake, and back in the room.
```

## Shape

A script is a head followed by one or more segments.

The **head** is everything before the first segment header. Only declarations
belong there — a line of prose in the head is a finding.

A **segment** opens on a line beginning with `#`. The rest of that line is its
imagery tag list, comma-separated; the tags may contain spaces. Then come the
segment's own declarations, if any, then **one blank line**, then its prose. The
blank line is what separates the two: without it the prose is read where
declarations belong and the script does not run.

Everything after that first blank line is prose to the end of the segment,
including further blank lines and any line that happens to hold a colon.

## Marks

An asterisk in the prose marks the words after it, and the next asterisk stops
marking them: `*heavy*` marks one word, `*down and further down*` marks four.
Marked words are shown in the marked colour instead of white and struck with the
app's snap on the beat they land on — a trigger word the session should carry
differently from the prose around it. The colour and the sound are the app's,
not the script's: a mark says which words, and nothing about how they look or
what they sound like. Every marked word of a run is struck, so
`*down and further down*` is four snaps on four beats.

The asterisks are never shown, and they are read before punctuation is stripped,
so `"*heavier,*"` marks `HEAVIER` with its quotes and comma gone. A mark that is
never closed marks the rest of its segment and stops at the segment's end — no
mark crosses a segment header.

## Declarations

A declaration is `key: value`, one to a line. Five keys exist; anything else is
a finding, as is the same key twice in one block.

| Key | Value | Default |
| --- | --- | --- |
| `bed` | `carrier/beat` in Hz, decimals allowed | `150/6` |
| `voice` | comma-separated clip pool tags, or empty for silence | none |
| `pace` | words per minute, decimals allowed | `220` |
| `gap` | seconds of silence between clips: `low-high`, or one number for a silence that never varies | `7-15` |
| `spiral` | one or two spirals: `rate`, `rate/depth`, `rate/from-to/seconds`, or empty | no spiral |

`bed`, `voice`, `pace`, `gap` and `spiral` are declared in the head for the whole
session and again on any segment that should differ, and each holds from there
until another segment changes it. Imagery tags never inherit: a segment header
is the whole truth about what is on screen under it, and a bare `#` leaves the
field blank.

## What the layers do with it

**Words.** Prose is split on whitespace, and punctuation at either edge of a
token is stripped. Line breaks in the file mean nothing to the reading. One word
is shown per beat, and the beat is the pace in force where that word sits — so
the duration on the selection screen is built segment by segment, not from a word
count. A marked word is that same word in the marked colour, snapped as it
lands: the same face at the same size on the same beat, since a mark that also
changed the weight or the timing would be a second layer of instruction rather
than a colour.

**Imagery.** A new photograph every eight words, drawn at random from the
segment's pools and never repeating the one on screen. Several tags on a header
are one flat union, so a 200-file pool and a 5-file pool named together make one
205-file draw, not a half-share each. A segment always opens a fresh slot on its
first word.

**Voice.** Clips are drawn from the pools the running `voice` names, one at a
time, separated by a gap drawn uniformly between the bounds `gap` declares and
measured from the end of one clip to the start of the next — so clips never
overlap, and how often a suggestion is heard is the gap and the length of the
clips together. A clip that would still be speaking after the last word is not
started. `voice:` with no tags silences the layer, and a later `voice:` with tags
starts its cadence fresh rather than resuming mid-gap.

The gap is drawn where the silence begins, so a segment that changes only `gap`
changes nothing about which suggestion is heard next: the clip already speaking
finishes, and the first silence to open under the new bounds is the first drawn
between them.

**Bed.** The two tones glide to a new pair on the first word of the segment that
declares it. The carrier is the left ear; the right ear carries the carrier plus
the beat frequency.

**Spiral.** A two-armed spiral turns between the photograph and the words, at
the rate in force where the session has got to, and takes the depth beside it —
`0.15` where only a rate is declared, `1` for a spiral the photograph does not
show through at all. A rate below zero turns it the other way; the bounds are on
the number and not on the direction. The angle is carried across a change of
rate, so a new declaration changes the speed and never jumps the spiral — a
reversal turns back from where the spiral had got to rather than from the top.
`spiral:` with no value stops it where it stands, and a later rate takes the
angle up from there. It is the one layer a script may leave out entirely, and
it stands still for the hold the session ends in.

Two spirals separated by a comma turn at once, one over the other, each with its
own rate and depth — and with one of the rates below zero they turn against each
other. Each keeps its own angle by its place in the declaration, so a segment
that drops the second and a later one that takes it up again take it up where it
stopped. What the two turn between them is bounded by what one may turn alone,
since a point is passed as often either way round.

A depth written as two bounds and a number of seconds swells rather than stands:
`0.1-0.4/40` travels from a tenth of the frame to four tenths and back every
forty seconds. The swell is measured from the start of the session rather than
from the segment that declares it, so a segment that changes only the rate moves
the speed without stepping the depth.

## What makes a script unplayable

A script with any finding is listed dim, with its count of problems, and opens
its findings instead of starting. Nothing is clamped or guessed: a value outside
its range would play a session the author did not write.

- `carrier` outside 50–1000 Hz, `beat` above 30 Hz, `bed` that is not a
  `carrier/beat` pair
- `pace` outside 40–240 words per minute, or not a number. The bounds are the
  word layer's own: above the high one the eight-word image slot passes half a
  hertz of full-screen luminance change, and below the low one a word is held so
  long the session reads as stopped rather than slow
- a `gap` bound outside 3–180 seconds, a pair of bounds written the long way
  round, or a value that is neither a number of seconds nor a `low-high` pair of
  them. Under three seconds the silence stops reading as a gap and two
  suggestions run together as one utterance; past three minutes a suggestion may
  not be heard in a session at all, which is a voice layer declared away rather
  than declared slow
- a spiral `rate` outside 0.5–12 turns per minute in either direction, a depth
  bound outside 0–1, a swell outside 10–600 seconds, or a value that is none of
  a rate, a `rate/depth` pair and a `rate/from-to/seconds` swell. The high rate
  bound is the imagery layer's: two arms passing a point at 12 turns a minute is
  0.4 Hz of luminance change, just under what a new photograph every eight words
  makes, and the low swell bound holds one pass out and back at a quarter of
  that
- more than two spirals in one declaration, or a pair turning more than 12 turns
  per minute between them — two spirals pass a point as often as one turning at
  the sum of their rates
- an unknown declaration key, or one declared twice in a single block
- prose in the head, or prose in a segment without the blank line before it
- no segment header anywhere, or no words left once punctuation is stripped
- an imagery or voice tag naming a pool folder that does not exist, or one that
  holds no usable files

Images are read from `.jpg`, `.jpeg`, `.png`, `.webp` and `.avif`; clips from
`.wav`, `.mp3`, `.m4a`, `.ogg`, `.opus` and `.flac`. Pool folders may nest —
everything underneath a tag folder belongs to that tag.
