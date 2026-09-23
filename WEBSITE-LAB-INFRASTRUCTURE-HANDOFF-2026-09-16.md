# Il Suono Organizzato — infrastructure handoff — 2026-09-16

Status: **GITHUB READY / VERCEL PREVIEW LOOP WORKING / HOME 1 + HOME 2 RECOVERABLE**

## Repository

- Canonical repository: https://github.com/wshwlmLab/iso-website-previews
- Default branch: `main`
- Stable workflow: [WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md](./WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md)

## Final production architecture — binding project decision

The current Website Lab is for architecture, visual design, motion, interaction design, prototyping, review, and approved checkpoints. It is **not** the final production hosting stack.

- **ChatGPT Sites**: fast internal experimentation and working previews.
- **GitHub**: shared source of truth for candidates, checkpoints, and frozen/canonical baselines so another chat can continue the work safely.
- **Vercel**: non-production candidate previews and device/browser verification during the design phase.
- **Webflow**: the final website must be rebuilt and hosted in Webflow after the architecture and design are approved.
- **Cloudflare R2**: delivery/storage layer for website audio, field recordings, sound works, artist files, and other heavy assets.
- **Cloudflare Stream**: delivery layer for video and trailers.
- **Google Drive**: archive for original/master media files; it is not the public delivery layer.

Design and interaction decisions made in the Lab must therefore remain reproducible in Webflow. Complex behaviors may require Webflow custom code, but no current prototype should silently redefine Vercel or ChatGPT Sites as the final production host.

## Canonical baselines

### HOME 1 — Truck

- Frozen: [Il-Suono-Organizzato-HOME-1-TRUCK-FROZEN-2026-09-15.html](./Il-Suono-Organizzato-HOME-1-TRUCK-FROZEN-2026-09-15.html)
- Checkpoint: [HOME-1-TRUCK-FROZEN-CHECKPOINT-2026-09-15.md](./HOME-1-TRUCK-FROZEN-CHECKPOINT-2026-09-15.md)
- Approved public page: https://iso-home-truck-meter-01.willy-washburn.chatgpt.site/
- Frozen commit: `18c6aa92df80e2cff7f6c8895b65fd494a1e27ff`
- Important: the HOME 1 frozen HTML still references assets on the approved ChatGPT Sites deployment; those assets are not yet vendored into GitHub.

### HOME 2 — Terra Viva

- Original approved frozen: [Il-Suono-Organizzato-HOME-2-TERRA-VIVA-v20-FROZEN-2026-09-15.html](./Il-Suono-Organizzato-HOME-2-TERRA-VIVA-v20-FROZEN-2026-09-15.html)
- Portable canonical: [canonical/home-2/index.html](./canonical/home-2/index.html)
- Checkpoint: [HOME-2-TERRA-VIVA-FROZEN-CHECKPOINT-2026-09-15.md](./HOME-2-TERRA-VIVA-FROZEN-CHECKPOINT-2026-09-15.md)
- Approved public page: https://il-suono-organizzato-terra-viva.willy-washburn.chatgpt.site

The portable canonical was verified byte-identical to the approved frozen after restoring the two original asset URLs. No design or behavior changed.

## HOME 2 assets

Directory: [canonical/home-2/assets/](./canonical/home-2/assets/)

- `terra-viva-reference-01-approved.png`
  - 1672 × 941 RGB PNG
  - SHA-256 `7f13624345f1d9b01bcf9647938e8c93bf5c67efd590b24d060e0e9998270d06`
- `terra-viva-terrain-depth.png`
  - 512 × 288 grayscale PNG
  - SHA-256 `0d62a71c424d7f4a9ec26bc4babf271d774905009a52fcbe2bc079fa177040d2`

The portable HOME 2 contains relative asset references and no `chatgpt.site/assets` dependency.

## Stable candidate method

Required sequence:

1. branch from `main`: `candidate/<page>-<slug>-<date>`;
2. copy the relevant canonical/frozen baseline into a separate candidate path;
3. apply only the requested delta;
4. push the candidate branch;
5. Vercel Git integration creates a non-production Preview Deployment automatically;
6. verify the preview before sending the public link;
7. after explicit William approval only, create a new dated frozen/checkpoint and merge deliberately.

Never overwrite an existing frozen. Never reconstruct a page from conversation memory. n8n is not part of this normal loop.

## Vercel — verified state

Connected project:

- project name: `iso-website-previews`
- Project ID: `prj_JykIMJQJOWPS1mFs4jDEi9urepAj`
- team name: `willywashburn-6607's projects`
- team slug: `willywashburn-6607`
- Team ID: `team_IOOtcikb40Ao1I3H1ts4A6LF`
- linked GitHub repository: `wshwlmLab/iso-website-previews`

Verified behavior: pushing a `candidate/...` branch triggers a Vercel Preview Deployment. This is the normal website-development loop from Chat.

## HOME 1 — current in-progress candidate

Requested delta: import the larger `+` dimensions from HOME 2 into the approved HOME 1 while preserving everything else.

Current branch:

- `candidate/home-1-plus-live-approved-2026-09-16`

Current candidate path:

- `candidates/home-1/plus-live-approved-2026-09-16/index.html`

Current public preview branch hostname:

- `https://iso-website-previews-git-candidate-ho-fcccf8-willywashburn-6607.vercel.app/candidates/home-1/plus-live-approved-2026-09-16/`

Current HOME 1 candidate implementation uses:

- frozen HOME 1 source as the baseline;
- same-origin Vercel asset proxy `api/home1-asset.js` for the approved HOME 1 external assets so the original canvas/halftone code can read them;
- only the `+` dimensions are overridden:
  - desktop: `width: clamp(128px, 10.4vw, 176px)`
  - mobile: `width: 136px`
  - plus line height: `5px`

Latest relevant candidate commit:

- `3a2995392a67196022287303c7cf2eda3d1cdee2`

The large `+` was approved visually by William. The candidate itself is **not yet frozen/approved as a new HOME 1 baseline**; do not merge or overwrite the frozen until explicit approval.

## Vercel Toolbar note

A black circular control visible at the right edge of Preview Deployments was identified as the **Vercel Toolbar**, not part of the website HTML. Do not edit the page to remove it.

It can be hidden locally with `Command + .` on Mac or disabled for Preview Deployments in the Vercel project settings. This UI overlay is separate from HOME 1.

## Rejected / superseded HOME 2 experiment

The green metallic-intro HOME 2 experiment was rejected. Return to the approved white-start HOME 2 baseline for future HOME 2 work. Do not treat the metallic intro as approved.

## Exact prompt for any new normal Chat

> Continua Il Suono Organizzato — Website Lab dal repository GitHub `wshwlmLab/iso-website-previews`. Leggi prima `WEBSITE-LAB-INFRASTRUCTURE-HANDOFF-2026-09-16.md`, `WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md` e il checkpoint della pagina interessata. Parti esclusivamente dall'ultima baseline frozen/canonical approvata. Non modificare né sovrascrivere alcuna frozen o canonical: crea una branch e una copia candidate separate, applica soltanto il delta richiesto, lascia che Vercel generi una Preview non-production e mandami direttamente il link pubblico verificato. Non usare n8n per il normale sviluppo del sito.
