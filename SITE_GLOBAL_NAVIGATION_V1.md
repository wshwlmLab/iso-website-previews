# ISO — Global Navigation v1

**Status:** approved direction — 2026-10-05

This file is the shared source of truth for the small navigation that lives in the upper black frame on framed pages.

## Visual rule

- Use the same type size as the bottom microcopy (`Rome / 2026`): `var(--micro-size)`.
- The navigation is not vertically centered in the black band. Its baseline is lowered to align visually with the lower line of the top identity text (`IL / SUONO`).
- Default tone: `#949494` on black.
- Hover/focus: white.
- Timezone text uses the same default tone: `#949494`.
- Keep a generous clear gap around the meter.
- The meter remains independent; navigation must not overlap or change meter behavior.

## Naming

Current working site names:

`HOME · FRAGMENT · FILM · BLOG · ABOUT`

Meaning:
- **HOME** = current internal “Soglia” page.
- **FRAGMENT** = randomized standalone/autorial experience page.
- **FILM** = current Works/film page.
- **BLOG**
- **ABOUT**

## Large navigation on Soglia

`FRAGMENT · BLOG · FILM · ABOUT`

On 2026-10-05, the large `HOME` label was renamed `FRAGMENT` and `WORKS` was renamed `FILM`. Letter creation, random entrances, hover and click exits use the updated `data-label` values. Use `FRAGMENT` in the singular in the upper black navigation as well.

## Page-specific display logic

The current page name is **omitted**, not highlighted.

- **HOME / Soglia:** no small global navigation at all. The large navigation already exists in the page.
- **BLOG landing:** `HOME · FRAGMENT · FILM · ARCHIVE · ABOUT`
  - BLOG is omitted because it is the current page.
  - ARCHIVE takes its place as the local destination.
- **BLOG archive:** `HOME · FRAGMENT · FILM · BLOG · ABOUT`
  - ARCHIVE is omitted because it is the current page.
  - BLOG takes its place to return to the Blog landing.
- **FILM:** `HOME · FRAGMENT · BLOG · ABOUT`
- **ABOUT:** `HOME · FRAGMENT · FILM · BLOG`
- **FRAGMENT:** separate case; current assumption is no shared black frame. Do not force this navigation onto it until its final structure is defined.

## Implementation

Shared CSS: `shared/global-nav-v1.css`.

Do not modify frozen/canonical page checkpoints in place. Adopt this rule in each page's current candidate/integration layer.
