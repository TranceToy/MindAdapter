# Web app as the session platform

_A fifth layer, the spiral, was added later and is drawn by the app rather than
taken from the library; see ADR 0003. The four below are the ones this decision
was made for._

A session runs four concurrent layers — word display, background imagery,
suggestion voice and binaural bed — and the platform choice decides the audio
stack and how assets are stored. We chose a browser web app: the Web Audio API
gives us sample-accurate scheduling and independent gain per layer, which the
binaural bed needs, and `requestAnimationFrame` drives word pacing against the
same clock the display refreshes on.

## Considered Options

- **Desktop (Electron/Tauri)** — rejected for now. Its wins are filesystem
  access to a large local asset library and freedom from browser autoplay and
  tab-focus rules. Both are real, and both can be revisited by wrapping the web
  app later; neither is worth paying for before the session player exists.
- **Mobile (native or PWA)** — rejected. Best ergonomics for headphone use, but
  background-audio and screen-wake restrictions would shape the whole design
  around platform limits rather than around the session.

## Consequences

- Binaural beats require the two channels to stay independent all the way to the
  output. Anything that downmixes to mono destroys the effect, so the graph must
  not route the bed through a mono node.
- Browsers won't start audio without a user gesture, so a session cannot
  auto-start; it begins from an explicit action on the page.
- The tab can be backgrounded or the screen can sleep mid-session. Whatever the
  session does about that is a design decision, not a bug to patch later.
