# A mark sounds

A mark has been a colour since ADR-0005: the word the session is built to
return to is amber where the prose around it is white, and nothing else about it
differs. That works while the words are being read. It stops working exactly
where the session is going — eyes half closed on a photograph, the spiral
turning under the word, the colour arriving on a beat too short to be looked at.
A trigger word that can only be seen is a trigger word the session loses at the
depth it was written for.

So a mark sounds as well as shows. Every marked word is struck once, on the beat
it lands on, with one short sound the app owns — the same sound every time, for
every mark. The script still says only which words; which sound a mark makes is
the app's, decided once, as its colour is. How loud that sound is against the
bed and the voice is not: the snap is a third calibration track, set by ear
beside the other two and never during a session.

## Considered Options

- **A sound the script names** — rejected, for the reason a script may not name
  the marked colour. A script that could name a file could name a two-second
  chord over a suggestion, and every script would then carry a second library of
  its own beside the pools.
- **One snap per marked run rather than per word** — rejected. A run is marked
  word by word — `*down and further down*` is four marked words, not one marked
  phrase — and a run that snapped once would make the mark mean two different
  things depending on where the asterisks fell.
- **A level fixed by the app, with no track of its own** — rejected. A colour
  can be decided once for every screen, but how loud a strike is against a bed
  is a property of the headphones, the room and the person: the two levels that
  already exist are calibrated for exactly that reason, and a snap the user
  found too sharp or could not hear would have no way out but the file itself.
  The ceiling under the track is still the app's: 0.5 of full scale, over the
  0.297 a suggestion is capped at and just under the bed's own 0.6.
- **A snap fitted into the headroom the other two leave** — rejected. The bed
  takes 0.6 of full scale and a clip 0.297 of it, so a snap held inside what is
  left would peak at 0.09, three times under the voice it interrupts and nearly
  seven under the bed it has to cut through. That is a strike heard while the words
  are being read and lost exactly where the session is going, which is the
  problem this decision was made for. The snap is a tenth of a second of
  broadband transient: at the top of all three tracks it can pass full scale for
  that tenth of a second, and a clipped transient is the cost of a trigger that
  arrives.
- **Ducking the bed under the snap** — rejected, as ducking under a clip was.
  A bed that moved for the mark would announce it a moment early, and a trigger
  the session flinches before is a trigger the user learns to brace against.
- **Scheduling a snap the way a clip is scheduled** — rejected. A clip is read
  off the library one at a time because the disk is not to be trusted with a
  deadline; the snap is one buffer held in memory, so the whole session's snaps
  are written into the audio clock in a single pass and a pause freezes them
  with the words.

## Consequences

- The mark is now two things that must not drift apart: the colour is written by
  the word field on the frame the beat arrives, and the snap is written into the
  audio clock in advance off the same word times. Both are read off the pace, so
  a segment that changes the pace moves them together.
- A session carries an asset. The library is still the whole of a session's
  content, but the app now ships one sound of its own, as it already ships the
  face the words are set in and draws the spiral itself.
- The calibration screen is three tracks rather than two, and the preview
  strikes as it plays: a snap every eight beats of the default pace, denser than
  a script should mark, so a level set there is a level no session overshoots.
- A calibration written before the snap track is read back a track short. The
  missing level is restored at the top of its track rather than at silence,
  which is what makes an older index a session with snaps in it rather than a
  session quietly without them.
- The mix is no longer clip-proof by arithmetic. The bed and the voice still sum
  under full scale, and a snap on top of both at the top of every track can pass
  it for the tenth of a second it lasts. Anyone who hears that, or wants a
  gentler mark, has the track to pull down; the two continuous layers are
  untouched by it.
- A sound that fails to load costs the snaps and nothing else: the session runs
  with the mark as the colour it was before this decision, and nothing is
  refused and nothing is said about it.
- Marking is now audible density. A script that marks a word every other line
  used to read as a second voice under the prose; it now sounds like one, which
  makes the advice to mark rarely a stronger one than it was.
