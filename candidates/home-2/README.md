# HOME 2 candidate workflow

Never edit a frozen or `canonical/home-2/` directly.

For each experiment:

1. Create a branch named `candidate/home-2-<short-slug>-<YYYYMMDD>` from `main`.
2. Copy `canonical/home-2/` to `candidates/home-2/<short-slug>/`.
3. Apply only the requested delta inside that candidate directory.
4. Preserve all unrelated bytes where possible and record the delta in a local `README.md`.
5. Deploy the non-production branch to a Vercel Preview.
6. Verify on desktop and iPhone: assets load, JavaScript runs, WebGL runs, click/audio state works.
7. If rejected, delete or archive the candidate; the frozen remains untouched.
8. If explicitly approved, create a new dated frozen file and update the canonical checkpoint. Never replace an older frozen.

n8n is not part of this normal development loop.
