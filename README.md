# Adapting the mind

A self-administered trance session player. One browser app runs five layers at
once — paced words, background imagery, spoken suggestion, a binaural bed, and a
spiral where a script asks for one — from content you own and author outside the
app.

Nothing about a session is set in the app. A script declares it, the app plays
what is declared and defaults the rest, and the session ends in a hold: the last
image on screen in silence until you leave it. A script that declares `loop: yes`
comes round instead — its first word follows its last, for as long as you leave
it running — and one that declares `shuffle: yes` draws the order its segments
come in afresh every round.

It runs at **<https://trancetoy.github.io/MindAdapter/>**. Nothing is uploaded:
the library stays on your disk and the browser reads it where it lies.

- The grammar of a script: [`docs/script-format.md`](docs/script-format.md)
- What to put in one: [`docs/writing-scripts.md`](docs/writing-scripts.md)
- The words this project uses, and the ones it refuses:
  [`CONTEXT.md`](CONTEXT.md)
- Why it is built this way: [`docs/adr/`](docs/adr/)

## The library

Everything a session plays comes from one folder on your own disk — the library.
The app reads it and never copies it. Three folders under it, by these names:

```
<library>/
  scripts/    one script per file, .md or .txt
  images/     one folder per image pool, named by its tag
  clips/      one folder per voice pool, named by its tag
```

A pool folder may nest: everything under a tag folder belongs to that tag.
Images are read from `.jpg`, `.jpeg`, `.png`, `.webp` and `.avif`; clips from
`.wav`, `.mp3`, `.m4a`, `.ogg`, `.opus` and `.flac`.

There is no import. Adding content means putting files in the library. Every
launch rescans it and reconciles the index — the browser-side cache of what the
last scan measured — against what is on disk, so losing the index costs a
measurement pass and a calibration, never content.

## What a browser needs

Two things have no fallback, and the precondition gate is those two and nothing
else: Web Audio, and some way to read a folder. A current Chromium, Firefox or
Safari has both.

Every other absence is carried rather than refused, and said on the screen where
it applies — see
[ADR 0002](docs/adr/0002-progressive-enhancement-over-a-precondition-gate.md):

- **No directory picker.** The library is picked again at every launch, and
  cannot be scaffolded — the three folders must already exist.
- **No fullscreen.** The session runs windowed, and Escape ends it.
- **No install.** It runs in a tab.
- **No IndexedDB.** Clips are measured and the levels calibrated again on the
  next launch.

Headphones are not a capability the app can test for. The bed is two tones, one
per ear; without them there is no binaural effect.

## Running it

Node 22 and npm.

```
npm install
npm run dev        # dev server on localhost
npm test           # the suite, once
npm run build      # typecheck, then a production build into dist/
npm run preview    # serve that build
```

A push to `main` runs the suite and the build and deploys to
<https://trancetoy.github.io/MindAdapter/>. Every built URL carries that
`/MindAdapter/` prefix, which is why `vite.config.ts` sets `base` and the
manifest and service worker in `public/` spell it out themselves.
