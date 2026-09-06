# Adapting the mind

A self-administered trance session player: one browser app that runs four
concurrent layers — paced words, background imagery, spoken suggestion and a
binaural bed — from content the user owns and authors outside the app.

The language below is fixed by the wayfinder map at
`.scratch/adapting-the-mind/map.md` and by `docs/adr/`.

## Language

### The session

**Session**:
One uninterrupted run of a script with all four layers playing together.
_Avoid_: run, playback, trance, experience

**Layer**:
One of the four concurrent streams a session is made of — word, image, voice,
bed. Layers share a clock and a start gesture; none can play alone.
_Avoid_: track, channel, stream

**Pace**:
The rate at which words are displayed, one word per beat, in words per minute.
A script declares it, in its head for the whole session and on any segment that
should run at a rate of its own; a script that declares none runs at 220. It is
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
