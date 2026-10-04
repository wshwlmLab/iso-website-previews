# ISO — Global Navigation v1

**Status:** approved direction — 2026-10-04

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

`HOME · FRAGMENT · WORK · BLOG · ABOUT`

Meaning:
- **HOME** = current internal “Soglia” page.
- **FRAGMENT** = randomized standalone/autorial experience page.
- **WORK** = current Works/film page.
- **BLOG**
- **ABOUT**

## Page-specific display logic

The current page name is **omitted**, not highlighted.

- **HOME / Soglia:** no small global navigation at all. The large navigation already exists in the page.
- **BLOG landing:** `HOME · FRAGMENT · WORK · ARCHIVE · ABOUT`
  - BLOG is omitted because it is the current page.
  - ARCHIVE takes its place as the local destination.
- **BLOG archive:** `HOME · FRAGMENT · WORK · BLOG · ABOUT`
  - ARCHIVE is omitted because it is the current page.
  - BLOG takes its place to return to the Blog landing.
- **WORK:** `HOME · FRAGMENT · BLOG · ABOUT`
- **ABOUT:** `HOME · FRAGMENT · WORK · BLOG`
- **FRAGMENT:** separate case; current assumption is no shared black frame. Do not force this navigation onto it until its final structure is defined.

## Implementation

Shared CSS: `shared/global-nav-v1.css`.

Do not modify frozen/canonical page checkpoints in place. Adopt this rule in each page's current candidate/integration layer.
