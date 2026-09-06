# Adapting the mind

A self-administered trance session player: one browser app that runs four
concurrent layers — paced words, background imagery, spoken suggestion and a
binaural bed — from content the user owns and authors outside the app, with a
fifth, the spiral, that turns only where a script asks for it.

The language below is fixed by the wayfinder map at
`.scratch/adapting-the-mind/map.md` and by `docs/adr/`.

## Language

### The session

**Session**:
One uninterrupted run of a script with all four layers playing together, and the
spiral turning wherever it is declared.
_Avoid_: run, playback, trance, experience

**Layer**:
One of the concurrent streams a session is made of — word, image, voice, bed and
spiral. Layers share a clock and a start gesture; none can play alone. Four of
them are in every session; the spiral is the one a script may leave out.
_Avoid_: track, channel, stream

**Spiral**:
The turning geometry between the imagery and the words, drawn by the app rather
than taken from the library. It is the only layer a session can run without: a
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
of the session rather than off the segment that declares it, so a change of rate
under an unchanged swell moves the speed without stepping the depth.
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
announces the end.
_Avoid_: outro screen, end screen, session summary, results

**Gap**:
The silence between one clip ending and the next beginning — drawn at random
between seven and fifteen seconds, and the only thing that governs how often a
suggestion is heard. Clips never overlap, because the gap is measured from the
end of one to the start of the next.
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
structure.
_Avoid_: text, transcript, session file, program

**Segment**:
A named stretch of a script that carries its own imagery tag and may declare its
own carrier, beat frequency and pace.
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
The two levels — voice and bed — the user sets on first run and cannot change
during a session. They persist in the index and are revisited only on demand.
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
