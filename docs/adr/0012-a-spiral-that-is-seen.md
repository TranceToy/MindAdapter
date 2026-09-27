# A spiral that is seen

The spiral read as pale and slow. Pale because a rate declared alone took a
fifteenth of the photograph and the lit band was a jade dark enough to sink into
it; slow because `RATE_HIGH` held at 12 after ADR 0008 halved what 12 spends,
leaving the spiral 0.2 Hz of a budget that had room for twice that.

So: **the spiral spends 0.4 Hz, and a bare rate is drawn at two fifths.**
`RATE_HIGH` is 24 — one arm passing a point at 24 turns a minute — which is the
share ADR 0006 first gave the spiral, taken back rather than left unspent.
`DEFAULT_DEPTH` is 0.4, and the jade is lighter and more luminous, so a pass is
a larger step from the ground.

## Considered Options

- **Wider bands at the same rate** — rejected. Fewer turns makes each pass sweep
  further and reads as faster at the same Hz, but it changes the shape ADR 0008
  settled and does not let a script ask for more turning.
- **`RATE_HIGH` at 30, 0.5 Hz** — rejected. It is the imagery's share exactly,
  and ADR 0006 holds that no two layers spend the same.
- **Leaving depth to the script** — rejected as the whole answer. A script can
  already declare any depth, but the default is what a bare rate looks like, and
  a bare rate should be a spiral that is seen.

## Consequences

- The ordering under the ceiling stands: imagery 0.5, spiral 0.4, swell 0.1,
  none the same. The swell is now a quarter of the spiral's share, not half.
- A pair is bounded at 24 between them, as one alone is.
- A script that declared only a rate now draws its spiral at 0.4 rather than
  0.15, over more of the photograph. A script that wants the old veil declares
  `rate/0.15`.
- The mark shares the jade, so it is lighter too.
- `docs/script-format.md`, `docs/writing-scripts.md` and `CONTEXT.md` say 24,
  0.4 Hz and two fifths.
