# HOME Truck — centered 5-bar meter checkpoint — 2026-09-14

Status: SAVED CHECKPOINT / CANDIDATE / NOT FROZEN

- Sites project: `appgprj_6aa7c474b4c4819189125639a5c81df8`
- Current deployed Site source commit: `40fa40cd202ba44f467e2d312931c84949ae1db9`
- Candidate URL: https://iso-home-truck-meter-01.willy-washburn.chatgpt.site/?effect=halftone-deeper-darks-meter-alive
- Source entry: `dist/index.html`

## Latest requested micro-diff

Remove the visible square/rectangle around the meter:

```css
.meter-hit {
  border: 0;
  border-radius: 0;
}
```

Keep unchanged:

- centered position;
- 5 bars × 16 segments;
- natural meter motion;
- pixel fade-in;
- mute interaction;
- all HOME visuals, plastic, typography and pixel effects.

The desired next state is: centered meter without any visible container or frame.
