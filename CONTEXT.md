# Adapting the mind

A self-administered trance session player: one browser app that runs four
concurrent layers — paced words, background imagery, spoken suggestion and a
binaural bed — from content the user owns and authors outside the app, with a
fifth, the spiral, that turns only where a script asks for it.

The language below is fixed by the decisions in `docs/adr/`.

## Language

### The session

**Session**:
One uninterrupted run of a script with all four layers playing together, and the
spiral turning wherever it is declared. A session is one round of the script, or
round after round of it where the script loops.
_Avoid_: run, playback, trance, experience

**Loop**:
What a script declares when it is to be played round after round rather than
once. Declared in the head and nowhere else, since what comes round is the whole
script and not a stretch of it, and defaulting to a script that plays once. A
looping session has no hold: the exit gesture is the only way out of it.
_Avoid_: repeat, cycle, replay, autoplay, continuous

**Round**:
One run of a script from its first word to its last — the unit a looping session
is made of, and the whole of a session that does not loop. Its length is what the
selection screen names. Nothing is reset at the seam between one round and the
next: the words come round, the imagery opens a fresh slot as it does on any
segment, the voice draws its suggestions again and carries its silence over, the
bed glides, and the spiral takes its angle up where the round before it left it.
_Avoid_: pass (which belongs to the spiral arm and the swell), iteration, cycle,
lap, repetition

**Layer**:
One of the concurrent streams a session is made of — word, image, voice, bed and
spiral. Layers share a clock and a start gesture; none can play alone. Four of
them are in every session; the spiral is the one a script may leave out.
_Avoid_: track, channel, stream

**Flash budget**:
The ceiling on how fast anything may change the frame's luminance — half a
hertz, a sixth of the flash threshold — and the share of it each layer spends:
the whole of it to the imagery, 0.2 Hz to the spiral, 0.1 Hz to the swell, none
at all to the words, which change a glyph and not the frame. It is spent at
authoring time: a script over it is refused, and a session never mentions it.
_Avoid_: flicker limit, strobe threshold, safety margin, photosensitivity warning

**Spiral**:
The turning geometry between the imagery and the words, drawn by the app rather
than taken from the library: one arm winding in to the centre, a lit band on a
dark one of twice its width, so what passes over a point is the whole step from
ground to light. It is the only layer a session can run without: a
script that declares no rate for it shows none at all. A script may declare two,
which turn at once and keep their own angles by the order they were written in;
two whose rates have opposite signs turn against each other.
_Avoid_: vortex, wheel, overlay, animation

**Rate**:
How fast the spiral turns, in turns per minute — the spiral's word for it, as
pace is the word layer's. A script declares it in its head and on any segment
that should turn at a rate of its own, and it is never the user's to adjust
during a session. A rate below zero turns the spiral the other way round: how
fast it turns is bounded, which way it turns is not. What two spirals turn
between them is bounded as one alone is, since a point is passed as often either
way round.
_Avoid_: speed, rpm, spin, pace (which belongs to the word layer)

**Depth**:
How much of the photograph the spiral takes, from none of it to all of it. It
rides on the rate declaration and defaults to a fifteenth. Declared as one
number it stands; declared as two bounds it swells between them.
_Avoid_: opacity, alpha, strength, intensity

**Swell**:
A depth that moves rather than stands: the two bounds it travels between and the
seconds one pass out to the far bound and back takes. It is read off the start
of the session rather than off the segment that declares it, or off the round,
so a change of rate under an unchanged swell moves the speed without stepping
the depth and the seam of a loop does not step it either.
_Avoid_: pulse, breathing, oscillation, fade, animation

**Pace**:
The rate at which words are displayed, one word per beat, in words per minute.
A script declares it, in its head for the whole session and on any segment that
should run at a pace of its own; a script that declares none runs at 220. It is
never the user's to adjust during a session.
_Avoid_: speed, wpm setting, tempo

**Hold**:
The state a session ends in: the final image left on screen in silence,
indefinitely, until the user's exit gesture leaves it. There is no screen that
announces the end. A looping session never reaches one, because it has no last
word to reach it from.
_Avoid_: outro screen, end screen, session summary, results

**Gap**:
The silence between one clip ending and the next beginning, and the only thing
besides the length of the clips that governs how often a suggestion is heard. A
script declares the two bounds it is drawn between, in its head and on any
segment that should speak at a cadence of its own; a script that declares none
is drawn between seven and fifteen seconds. Declared as one number it never
varies. It is drawn where the silence begins, so a segment that changes only the
gap leaves the clip already speaking and the bag it was drawn from alone. Clips
never overlap, because the gap is measured from the end of one to the start of
the next.
_Avoid_: interval, delay, cooldown, frequency

**Pause**:
What a session does when its window is hidden or its audio is interrupted — the
audio context is suspended and the word clock frozen, so no layer advances.
Resuming is always a deliberate click.
_Avoid_: stop, background mode, standby, idle

### Content

**Library**:
The single folder on the user's own disk that holds everything a session needs.
The app references it and never copies it; it is the source of truth for all
content.
_Avoid_: collection, media folder, vault, store

**Script**:
A file authored outside the app that supplies a session's words and its segment
structure, and says whether the session plays it once or loops it.
_Avoid_: text, transcript, session file, program

**Mark**:
What a script puts round a word, or a run of words, to have it shown in the
marked colour rather than white, and snapped, for the beats it is on — a trigger
word set apart from the prose it sits in. The script says which words; the
colour and the snap are the app's, and a mark changes nothing else about the
word, neither its size nor its beat.
_Avoid_: highlight, emphasis, bold, keyword, tag (which belongs to the pools)

**Segment**:
A named stretch of a script that carries its own imagery tag and may declare its
own carrier, beat frequency, pace and gap.
_Avoid_: section, block, scene, chapter

**Pool**:
A set of interchangeable assets any one of which may be drawn at random. A pool
is a folder on disk.
_Avoid_: album, set, group, category folder

**Tag**:
The name of a pool, by which a script asks for imagery or voice without naming
individual files. A tag is a folder name.
_Avoid_: label, category, keyword, class

**Clip**:
One audio file in a voice pool, holding a single spoken suggestion.
_Avoid_: sample, recording, voice file, snippet

**Suggestion**:
The spoken content a clip carries — the thing the voice layer is for.
_Avoid_: affirmation, prompt, cue

### Audio

**Bed**:
The binaural layer: two generated tones, one per ear, held under everything else
for the length of a session.
_Avoid_: background audio, drone, tone, ambience

**Carrier**:
The pitch of the bed's left-ear tone, from which the right-ear tone is offset.
_Avoid_: base tone, frequency, root

**Beat frequency**:
The offset between the bed's two tones, which is the binaural effect itself.
_Avoid_: beat (bare — that word belongs to the word layer), binaural rate

**Snap**:
The sound a mark makes: one short strike on the beat every marked word lands on,
heard as often as words are marked and no oftener. It is the app's own sound
rather than the library's, and it is not a layer — a mark is heard as well as
seen, the way it is coloured as well as shown. Which sound it is belongs to the
app; how loud it is against the bed and the voice is a calibration track like
theirs.
_Avoid_: click, trigger sound, cue, sting, sixth layer

### Setup

**Index**:
The browser-side cache of what the last scan measured. Expendable by design:
losing it costs time, never content.
_Avoid_: database, catalogue, manifest, metadata store

**Rescan**:
The walk of the library that happens on every launch and reconciles the index
with what is on disk. There is no separate import: adding content means putting
files in the library.
_Avoid_: import, sync, refresh, ingest

**Calibration**:
The three levels — voice, bed and snap — the user sets on first run and cannot
change during a session. They persist in the index and are revisited only on
demand.
_Avoid_: volume settings, mixer, levels screen

**Precondition gate**:
The refusal shown in place of the app, and only for the two things nothing falls
back to: no Web Audio, or no way at all to read a folder. Everything else a
browser lacks is carried rather than refused — no picker means the library is
picked again at every launch, no fullscreen means a windowed session that Escape
ends, no install means a tab, no index means measuring again.
_Avoid_: splash, compatibility warning, onboarding, requirements check

**Library source**:
Where a library's bytes are reached: the folder handle a picker hands over,
which outlives a launch, or the file list a folder upload hands over, which does
not. Nothing below the scan can tell which one it was given.
_Avoid_: adapter, provider, backend, driver
