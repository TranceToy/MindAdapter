# Progressive enhancement over a precondition gate

The app used to state its preconditions and refuse everything that missed one:
a Chromium engine, the File System Access API, and an installed window. Two of
the three were never capabilities. An installed window buys chrome-free
presentation and nothing a session needs, and a folder can be read without the
picker — `<input type="file" webkitdirectory>` hands over the same tree, which
Firefox and Safari both do. So the gate now refuses only what nothing falls back
to — no Web Audio, or no way at all to read a folder — and every other absence
is carried as a named degradation.

## Considered Options

- **Keep the gate as it was** — rejected. It refused browsers that can run all
  four layers, and its own copy ("refused, not degraded") described a decision
  about presentation as if it were a limit of the platform.
- **Degrade everything, warn about nothing** — rejected. Where the degradation
  changes what the user must do — picking the folder at every launch, ending a
  windowed session with Escape — it is said on the screen where it applies,
  before the session rather than during it.
- **Two builds, one per capability tier** — rejected. One source with one
  fallback path per capability is smaller than two of anything, and the fallback
  is exercised on every launch that lacks a picker rather than only in a
  separate build.

## Consequences

- A library is reached through a library source, not a directory handle. The
  picker's handles and the folder input's files answer the same two questions —
  the pools of a section, and the scripts — and the scan, the layers and the
  session know nothing else about them.
- Paths are identical under both sources, because the folder input's leading
  folder name is dropped. The clip index is keyed by path, so measurements
  survive a move between browsers and a browser without handles still skips
  measuring what it has already measured.
- Without a picker the library is picked at every launch and cannot be
  scaffolded: the three folders must already exist, and a folder holding none of
  them is reported rather than created.
- The index is expendable in fact and not only in principle. Every read of it
  may come back with nothing — a blocked or absent IndexedDB costs a measurement
  pass and a calibration, and stops nothing.
- A session that could not enter fullscreen still runs, watching for Escape in
  place of a fullscreen loss. Both are the same key and end a session the same
  way.
