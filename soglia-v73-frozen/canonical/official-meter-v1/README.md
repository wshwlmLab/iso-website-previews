# Il Suono Organizzato — Official Meter v1

Status: APPROVED / FROZEN  
Date: 2026-09-20

The canonical implementation is the meter embedded in `dist/index.html`, marked by the comments:

- `ISO OFFICIAL METER v1 — FROZEN 2026-09-20`
- `ISO OFFICIAL METER v1 — canonical stereo VU implementation`

Future pages must copy that implementation without visual reinterpretation. Improvements must create a new explicit version rather than silently changing v1.

## Frozen visual specification

- Two stereo columns.
- 16 horizontal segments per column.
- Meter outer size: `clamp(52px, 4.2vw, 62px)` × `clamp(32px, 2.85vw, 41px)`.
- Active zone: 50% of the outer width and 80% of the outer height.
- Column gap: `clamp(4px, .35vw, 6px)`.
- Every segment is exactly 1 CSS pixel high and is distributed evenly with `space-between`.
- Inactive and muted color: `#343434`.
- Active color: `#f1f1f1`.
- Mute slash: `#f1f1f1`, 2 CSS pixels high, rotated −40°.
- Placement on the Soglia page: horizontally centered, vertically centered inside the upper black frame.

## Frozen behavior

- Real Web Audio metering; no random animation.
- Independent left/right RMS analysis with mono fallback.
- VU-style averaging: faster attack and slower release.
- The meter is visible at zero before audio begins.
- On the Soglia page, audible level follows the progressive photographic reveal.
- Clicking the meter mutes audio and shows the diagonal slash.
- Mute and unmute use a one-second linear audio fade.
- Any site-wide adaptation must preserve these visual and dynamic characteristics while connecting to the audio graph used by that page.

## Canonical files

- `dist/index.html`: complete working reference.
- Cloudflare R2 object `Endless Ascent.wav`: current remote audio used by the Soglia demonstration.
- `dist/soglia-frozen.html`: approved Soglia page used by the demonstration.

The audio origin is intentionally kept separate in `dist/index.html` as `audioBaseUrl`.
Replace only that value when the production domain `audio.ilsuonorganizzato.com`
becomes active; the meter implementation must remain unchanged.

This directory documents the approved baseline. The Git revision containing this document is the recovery point for Official Meter v1.
