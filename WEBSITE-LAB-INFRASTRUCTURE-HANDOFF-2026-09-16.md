# Il Suono Organizzato — infrastructure handoff — 2026-09-16

Status: **GITHUB READY / HOME 2 PORTABLE / VERCEL CONNECTION BLOCKED**

## Repository

- Canonical repository: https://github.com/wshwlmLab/iso-website-previews
- Default branch: `main`
- Stable workflow: [WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md](./WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md)

## Canonical baselines

### HOME 1 — Truck

- Frozen: [Il-Suono-Organizzato-HOME-1-TRUCK-FROZEN-2026-09-15.html](./Il-Suono-Organizzato-HOME-1-TRUCK-FROZEN-2026-09-15.html)
- Checkpoint: [HOME-1-TRUCK-FROZEN-CHECKPOINT-2026-09-15.md](./HOME-1-TRUCK-FROZEN-CHECKPOINT-2026-09-15.md)
- Approved public page: https://iso-home-truck-meter-01.willy-washburn.chatgpt.site/

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

## Candidate method

Instructions: [candidates/home-2/README.md](./candidates/home-2/README.md)

Required sequence:

1. branch from `main`: `candidate/<page>-<slug>-<date>`;
2. copy the relevant canonical baseline into a separate candidate path;
3. apply only the requested delta;
4. deploy the non-production branch as a Vercel Preview;
5. verify desktop and iPhone, including JavaScript/WebGL;
6. after explicit approval only, create a new dated frozen and update its checkpoint.

Never overwrite an existing frozen. n8n is not part of this loop.

## Vercel — verified state

Connected team:

- name: `willywashburn-6607's projects`
- slug: `willywashburn-6607`
- team ID: `team_IOOtcikb40Ao1I3H1ts4A6LF`

The connected Vercel account returns **zero projects**. Therefore these values are not yet verifiable:

- real project name;
- project ID (`prj_...`);
- existing Vercel preview/production URLs;
- Git integration and deploy permission.

No Vercel deployment was created or altered. Connect the Vercel account/team that owns the real project, then fill in those values and perform one isolated preview deployment from a candidate branch.

## Remaining limits

- Vercel access is the only blocker to the full deploy/preview loop.
- HOME 1 is frozen and recoverable, but its current HTML still references image assets hosted by its approved Sites deployment. Asset vendoring was requested and completed only for HOME 2.
- The approved Sites URLs remain the currently verified mobile/public versions.

## Exact prompt for a normal Chat

> Continua Il Suono Organizzato — Website Lab dal repository GitHub `wshwlmLab/iso-website-previews`. Leggi prima `WEBSITE-LAB-INFRASTRUCTURE-HANDOFF-2026-09-16.md`, `WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md` e il checkpoint della pagina interessata. Verifica in lettura i file frozen e gli asset. Non modificare né sovrascrivere alcuna frozen o canonical: crea una branch e una copia candidate separate, applica soltanto il delta richiesto, quindi pubblica esclusivamente una Vercel Preview non-production. Prima di procedere dimmi repository, baseline scelta, path della candidate, project ID Vercel e team ID effettivamente verificati.
