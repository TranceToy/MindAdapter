# Adapting the mind

Status: needs-info

Captured from the Q1 (a) answer. Everything below the Open Questions line is
still unanswered — this is a brief, not a finished spec. Sharpen with
`/grill-with-docs`, then re-publish through `/to-spec`.

## Problem Statement

The user wants a self-administered trance session: a single session that
combines rapidly-paced text, matching imagery, spoken suggestion and binaural
audio into one experience, rather than assembling those layers by hand from
separate tools each time.

## Solution

A session player with four concurrent layers:

1. **Text layer** — displays a script one word at a time, quickly: fast, but
   just slow enough that each word can still be processed.
2. **Image layer** — the background displays images corresponding to the text
   currently on screen.
3. **Voice layer** — audio plays suggestions drawn at random from a pool. The
   theme of the pool is submission and obedience.
4. **Binaural layer** — binaural beats underneath the other audio.

## User Stories

Drafted from the Q1 (a) answer; not yet confirmed.

1. As a user, I want the script displayed one word at a time, so that each word
   lands on its own rather than being skimmed as a sentence.
2. As a user, I want the word pace fast but readable, so that the display holds
   my attention without outrunning my comprehension.
3. As a user, I want background images that correspond to the words on screen,
   so that the visual and verbal layers reinforce each other.
4. As a user, I want spoken suggestions drawn at random, so that repeat sessions
   don't become predictable.
5. As a user, I want binaural beats mixed under the voice, so that the audio
   layer carries the induction as well as the words.
6. As a user, I want the four layers to run as one session rather than as
   separate players, so that starting a session is a single action.

## Out of Scope

- Visual enhancements such as spirals. Explicitly deferred, not rejected.

## Open Questions

These block turning the brief into a spec.

~~1. **Platform.**~~ Settled: browser web app. See
ADR-0001 (`docs/adr/0001-web-app-as-the-session-platform.md`).

2. **Script source.** Where do the word sequences come from — authored files
   checked into the repo, a library the user edits, or generated?
3. **Pacing model.** Fixed words-per-minute, user-configurable, or ramping over
   the course of a session? Does punctuation or line break insert a pause?
4. **Image correspondence.** How does an image get matched to text — one image
   per word, per phrase, or a tag on a script segment that selects from a set?
5. **Audio mixing.** How do the suggestion voice and the binaural bed relate?
   Fixed levels, ducking the bed under the voice, independent user gain?
6. **Suggestion pool.** Same source as the script, or a separate pool? How
   often does one fire — on a timer, or tied to script position?
7. **Session shape.** How does a session end — fixed length, script length, or
   user-ended? Is there a wind-down / wake segment, or does it just stop?
8. **Interrupt.** Recommend an always-live stop that kills all four layers at
   once and doesn't depend on reading the screen. Worth deciding as a
   requirement now rather than retrofitting.
