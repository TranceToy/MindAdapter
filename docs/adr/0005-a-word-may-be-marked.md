# A word may be marked

The word layer has had one appearance since the first session: white, uppercase,
one word to a beat, every word exactly like the one before it. That sameness is
most of what the layer does — nothing about a word says it matters more than its
neighbour, so the prose is followed rather than read. But a script has trigger
words in it, words the session is built to return to, and until now the only way
to point at one was to repeat it.

So a script may mark a word, and a marked word is shown in amber instead of
white. Marking is punctuation rather than a declaration: an asterisk turns the
marking over, so `*heavy*` marks a word and `*down and further down*` marks a
run. Nothing about the mark is the script's but which words carry it.

```
Your arms are *heavy*, and heavier.
```

## Considered Options

- **A `colour:` declaration** — rejected. A colour is a property of a word, not
  of a stretch of the session, and every other declaration inherits down the
  segments. A key that meant "these words, and no others" would be the first
  declaration that pointed inside the prose.
- **The script naming the colour** — rejected. The palette is the app's
  everywhere else — the word is `--lit`, the spiral is white geometry, the
  ground is black — and a script that could name a colour could name an
  unreadable one over a photograph. A mark says which words; what a mark looks
  like is one decision, made once.
- **A mark that changes weight or size instead of colour** — rejected. Both are
  measured: the field is fitted to the widest word the session will ever hold,
  so a heavier or larger word would either reflow the fit or overrun the frame.
  A colour changes no measurement at all.
- **Holding a marked word longer than a beat** — rejected. Every word is held
  exactly as long as every other, which is what makes the pace the whole of the
  rhythm and what lets every other layer be scheduled by counting words. A word
  worth two beats would break the count the imagery, the voice and the bed are
  all placed by.
- **An unclosed mark as a finding** — rejected. Findings are read off
  declarations, which carry the line they were written on; prose is kept as
  words and nothing else. Reporting an unclosed mark would mean threading line
  numbers through the tokeniser for a mistake whose consequence is visible in
  the first seconds of the session.

## Consequences

- A word is no longer a string. The tokeniser hands back a text and whether it
  is marked, and that pair travels from the parse through the segments to the
  field, so anything that counts words counts them exactly as before.
- The mark is read before punctuation is stripped, because the asterisk is
  punctuation itself. That order is what lets `"*heavier,*"` mark the word with
  its quotes and comma gone.
- A run of marks cannot cross a segment header: prose is tokenised a segment at
  a time, so a mark left open marks the rest of its segment and no more.
- The field's single write per beat still stands. The colour rides the write
  that already sets the text, so there is no frame in which the word is blank or
  between colours.
- Every script written before the mark plays exactly as it did, unless it holds
  an asterisk in its prose — where it does, that asterisk used to be stripped as
  punctuation and now marks what follows it.
