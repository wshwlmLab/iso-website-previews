# Pagina Soglia v68 — FROZEN — 2026-09-23

Approved recovery point for the current Pagina Soglia prototype.

## Canonical source

- Git commit: `8116042d9b97c63b0b57e94c8f6171154cf5540d`
- Page shell and real stereo meter: `dist/index.html`
- Frozen Soglia experience and motion system: `dist/soglia-frozen.html`
- Audio object: Cloudflare R2 `Endless Ascent.wav`

## Approved state

- Compact phrase spacing uses the v68 three-line geometry.
- The compact coordinates are shared by animation arrival and departure.
- The real stereo meter remains connected to the Cloudflare R2 audio.
- Mute and unmute use the one-second fade introduced in v67.

## Known open issue

- A click can still be audible when muting or unmuting from the meter. This is
  intentionally recorded as an unresolved issue and does not invalidate this
  frozen visual and interaction baseline.

Future experiments must preserve this commit as the rollback point.
