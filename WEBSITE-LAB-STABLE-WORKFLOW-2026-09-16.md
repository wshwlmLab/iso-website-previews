# Il Suono Organizzato — stable website workflow

## Source of truth

Repository: `wshwlmLab/iso-website-previews`

## Binding production target

This repository and its previews are the shared **design and prototyping environment**. The final website will be **rebuilt and hosted in Webflow** once architecture, visual language, motion, and interactions are approved.

Platform roles:

- ChatGPT Sites: rapid internal iteration;
- GitHub: durable shared candidates, checkpoints, and frozen/canonical baselines;
- Vercel: non-production candidate previews and verification;
- Webflow: final build and production hosting;
- Cloudflare R2: public audio and heavy-asset delivery;
- Cloudflare Stream: video and trailer delivery;
- Google Drive: original/master media archive.

Every approved behavior should be designed with Webflow reproducibility in mind. Use Webflow custom code later where native Webflow interactions are insufficient. Do not treat the current Vercel or Sites deployments as the final production website.

Current canonical baselines:

- HOME 1: `Il-Suono-Organizzato-HOME-1-TRUCK-FROZEN-2026-09-15.html`
- HOME 2 original frozen: `Il-Suono-Organizzato-HOME-2-TERRA-VIVA-v20-FROZEN-2026-09-15.html`
- HOME 2 portable canonical: `canonical/home-2/index.html`
- HOME 2 assets: `canonical/home-2/assets/`

## Required flow

`frozen on main → candidate branch/copy → surgical delta → Vercel Preview → desktop/iPhone verification → explicit approval → new frozen`

Rules:

- Never overwrite a frozen.
- Never reconstruct a page from conversation memory.
- Begin from the latest canonical checkpoint.
- Change only the requested delta.
- Preserve unrelated source byte-for-byte where practical.
- A rejected candidate has no effect on the approved baseline.
- n8n is not required for ordinary page development.

## Vercel preview convention

Use a non-production Git branch named `candidate/<page>-<slug>-<date>`. With Vercel Git integration, each non-production branch must create an isolated Preview Deployment. Do not promote or deploy to production before explicit approval.

## Current Vercel access status

Connected Vercel team visible from ChatGPT:

- team name: `willywashburn-6607's projects`
- team slug: `willywashburn-6607`
- team ID: `team_IOOtcikb40Ao1I3H1ts4A6LF`

The connected account currently returns zero projects. Therefore the real legacy preview project, its project ID, deployment access, and Git integration cannot yet be verified. Connect the Vercel account/team that owns the existing project, then record its project name and `prj_...` ID here.
