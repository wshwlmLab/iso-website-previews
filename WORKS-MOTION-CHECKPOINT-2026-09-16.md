# WORKS — Motion checkpoint — 2026-09-16

Purpose: allow a new ChatGPT Work chat to resume the WORKS page exactly from the latest state without rereading the previous chat.

## Read first

Before editing, read:
- `WEBSITE-LAB-INFRASTRUCTURE-HANDOFF-2026-09-16.md`
- `WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md`
- this file

Repository: `wshwlmLab/iso-website-previews`

## Frozen baseline — NEVER MODIFY

`works-real-clips-v07-fixes.html`

Approved geometry inherited from v07 and to preserve unless William explicitly asks otherwise:

Desktop:
- `--side:5.55vw`
- `--large-w:88.9vw`
- `--large-h:50.00625vw`
- `--medium-w:79vw`
- `--medium-h:44.4375vw`
- `--wide-w:84vw`
- `--wide-h:47.25vw`
- `--gap:7.5vh`
- `.topspace{height:44vh;min-height:320px}`
- `.endspace{height:42vh}`

Mobile:
- `--side:5vw`
- `--large-w:90vw; --large-h:50.625vw`
- `--medium-w:82vw; --medium-h:46.125vw`
- `--wide-w:86vw; --wide-h:48.375vw`
- `--gap:6.8vh`

Other approved media basics:
- `.media { position:absolute; top:0; overflow:hidden; background:transparent; }`
- `.video-frame { position:absolute; inset:-3.8%; width:107.6%; height:107.6%; border:0; display:block; background:#000; transform:scale(1.035); pointer-events:none; }`
- `.media .underlay { position:absolute; inset:0; background:#050505; }`
- `PICTURE_SAFE_RATIO=0.88`
- technical container must never appear as an independent visible layer.

## User's target feeling

Only two conceptual visible layers:
1. page background (white/starfield)
2. actual video image/content rectangle

Never expose technical media container, black underlay, mask, iframe/player surface, or band as a third visual layer.

The motion target is NOT a simple fixed gap change. Keep approved `--gap` values. The spacing is created visually through the video travel and its scroll-linked motion.

Desired behavior:
- while scrolling down, background is visible before the next video enters;
- then the whole video enters from below with a gentle, natural acceleration;
- video should travel visibly for a meaningful distance, rather than suddenly appearing;
- when scrolling upward, the same behavior must happen in exact reverse / mirror;
- mouse/browser scroll itself must remain native and responsive;
- the movement may feel elastic/spring-like, but must never make the wheel feel stuck, heavy, or blocked;
- do not create a long dead interval with no video; William's latest feedback is that there is currently **too much empty background**;
- preserve the sense of movement. Do not solve scroll problems by flattening/removing the video motion.

## Critical latest feedback

William's latest message after v21:

> "non va bene ora hai levato il movimento. continuo il lavoro in una chat work"

Interpretation: v21 is rejected because, despite increasing travel numbers, the perceived motion has effectively disappeared / become too flat. The next version must restore a clearly perceptible moving video while retaining native scroll responsiveness.

Immediately before that, on v20, William said:

> "non funziona, fai fare piu strada al video, ora c'e' troppo spazio senza video."

So the unresolved combination is:
- **more visible travel by the video**
- **less dead/background-only interval**
- **retain soft acceleration**
- **same mirrored behavior upward**
- **native, unblocked wheel scroll**
- **do not remove motion**

## Version trail and what each taught us

### v17
`works-real-clips-v17-50pct-more-background-symmetric-candidate.html`

Useful reference for the earlier desired motion character:
```js
const PICTURE_SAFE_RATIO=0.88;
const MEDIA_ENTRY_START=0.70;
const MEDIA_ENTRY_SETTLE=0.12;
const MEDIA_EXIT_START=0.36;
const MEDIA_EXIT_SETTLE=0.02;
const MEDIA_TRAVEL=0.84;
const mediaEase=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10);};
```
Travel used:
```js
const travel=Math.min(vh*0.63,mediaH*MEDIA_TRAVEL);
```
This branch had the right general idea of a strong whole-media travel / easing character, but scroll feel became problematic.

### v18
`works-real-clips-v18-native-scroll-symmetric-elastic-candidate.html`

Attempted to keep native browser scroll while preserving symmetric elastic motion. User still reported scroll blocked / unusable upward. Do not reproduce its wheel-feel problem.

### v19 — rejected approach
`works-real-clips-v19-strict-native-scroll-baseline-candidate.html`

Solved scroll by forcing media transform to zero. This destroyed the spacing/motion work. User immediately rejected because all recent spacing/acceleration work disappeared.

Do **not** use v19 as creative baseline.

### v20 — partial but rejected
`works-real-clips-v20-native-scroll-restored-spatial-easing-candidate.html`

Current important code:
```js
const MEDIA_ENTRY_START=0.90;
const MEDIA_ENTRY_SETTLE=-0.40;
const MEDIA_TOP_START=0.10;
const MEDIA_TOP_SETTLE=1.40;
const MEDIA_TRAVEL=0.84;
const mediaEase=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10);};
```

Travel:
```js
const travel=Math.min(vh*0.50,mediaH*MEDIA_TRAVEL);
```

It removed temporal spring inertia by assigning directly:
```js
const mediaTarget=entryOffset+topOffset;
s.mediaMotion.x=mediaTarget;
s.mediaMotion.v=0;
const mediaY=mediaTarget;
media.style.transform=`translate3d(0,${mediaY.toFixed(3)}px,0)`;
```

This kept page scroll native, but William said there was too much blank/background-only space and asked for the video to travel farther.

### v21 — latest candidate, rejected
`works-real-clips-v21-longer-visible-travel-native-scroll-candidate.html`

Latest constants:
```js
const PICTURE_SAFE_RATIO=0.88;
const MEDIA_ENTRY_START=1.35;
const MEDIA_ENTRY_SETTLE=-0.05;
const MEDIA_TOP_START=-0.35;
const MEDIA_TOP_SETTLE=1.05;
const MEDIA_TRAVEL=0.84;
const mediaEase=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10);};
```

Latest travel:
```js
const travel=Math.min(vh*0.65,mediaH*MEDIA_TRAVEL);
```

Still direct spatial mapping, no temporal spring:
```js
const mediaTarget=entryOffset+topOffset;
s.mediaMotion.x=mediaTarget;
s.mediaMotion.v=0;
const mediaY=mediaTarget;
```

User verdict: **movement has effectively been removed**. Therefore do not continue by merely increasing constants in this same flat mapping without restoring perceptible motion character.

## Best next technical direction

Create a NEW candidate (v22 or later). Never overwrite prior candidates.

Start from a version that still contains the desired visual motion character (v17/v18 are better references than v19), but fix the scroll problem structurally rather than removing movement.

Key principle:
- browser/document scroll position must be the source of truth and must never be intercepted or eased;
- no `wheel` preventDefault / synthetic scroll / scroll lag;
- the media may have a scroll-position-derived transform;
- if spring is used, it must be tightly bounded and direction-responsive so reversing the wheel immediately reverses target behavior rather than fighting the user;
- avoid a large temporal lag between scroll position and media position;
- keep a clear moving trajectory visible on screen;
- reduce dead blank time relative to v20/v21 by bringing the actual video into the viewport earlier while letting it continue to travel farther after it appears.

A useful design distinction for the next attempt:
- **entry visibility threshold** controls how long the page is empty;
- **travel distance** controls how much visible motion occurs;
Do not couple these by simply pushing the start farther off-screen. William wants **less empty time AND more visible travel**.

## Workflow / deployment rules

- Frozen baseline `works-real-clips-v07-fixes.html` must remain untouched.
- Every experiment = new file/version.
- After each change, deploy and give William a direct clickable Vercel preview.
- Do not narrate routine implementation details; William wants to see the result quickly.
- Do not claim anything is approved/frozen until William explicitly says so.
- Prefer literal static HTML deployment; avoid loader wrappers that previously caused frozen/broken previews.

n8n publisher workflow:
- workflow ID: `HEWj5IyrTdEmWjDD`
- name: `ISO Website — GitHub Publisher — v0.1`
- GitHub repo: `wshwlmLab/iso-website-previews`

## Current preview links

v20:
`https://iso-website-previews-git-main-willywashburn-6607.vercel.app/works-real-clips-v20-native-scroll-restored-spatial-easing-candidate.html?v=20`

v21 latest rejected:
`https://iso-website-previews-git-main-willywashburn-6607.vercel.app/works-real-clips-v21-longer-visible-travel-native-scroll-candidate.html?v=21`

## Resume instruction for the next Work chat

When William says "riprendi da dove ho lasciato", the next chat should:
1. read the three handoff/checkpoint files listed at the top;
2. treat v21 as latest rejected candidate, not as approved state;
3. create a fresh next candidate;
4. preserve geometry/content unless needed;
5. specifically solve: **restore perceptible movement + more visible travel + less blank interval + native bidirectional scroll**.
