# Il Suono Organizzato — Website Lab — Canonical handoff — 2026-09-15

Status: **CURRENT EXTERNAL MEMORY / NEW-CHAT ENTRY POINT**

Questo documento e' il punto di ingresso per continuare il progetto in una nuova chat. Prima di modificare una pagina, leggere il checkpoint specifico indicato qui sotto e partire esclusivamente dal relativo file frozen.

## HOME 1 — Truck

Status: **APPROVED / FROZEN**

- Checkpoint: [HOME-1-TRUCK-FROZEN-CHECKPOINT-2026-09-15.md](./HOME-1-TRUCK-FROZEN-CHECKPOINT-2026-09-15.md)
- Baseline: [Il-Suono-Organizzato-HOME-1-TRUCK-FROZEN-2026-09-15.html](./Il-Suono-Organizzato-HOME-1-TRUCK-FROZEN-2026-09-15.html)
- Pagina pubblica: https://iso-home-truck-meter-01.willy-washburn.chatgpt.site/
- Regola: questa versione sostituisce il vecchio file `v10-FROZEN` e il checkpoint candidato del 2026-09-14.

## HOME 2 — Terra viva

Status della pagina: **APPROVED / FROZEN**

- Checkpoint: [HOME-2-TERRA-VIVA-FROZEN-CHECKPOINT-2026-09-15.md](./HOME-2-TERRA-VIVA-FROZEN-CHECKPOINT-2026-09-15.md)
- Baseline: [Il-Suono-Organizzato-HOME-2-TERRA-VIVA-v20-FROZEN-2026-09-15.html](./Il-Suono-Organizzato-HOME-2-TERRA-VIVA-v20-FROZEN-2026-09-15.html)
- Pagina pubblica: https://il-suono-organizzato-terra-viva.willy-washburn.chatgpt.site

### Esplorazione successiva ancora aperta

Si sta studiando una nuova immagine iniziale, precedente all'emersione della foresta. **Non e' ancora approvata e non sostituisce la baseline frozen.**

Vincoli consolidati dall'ultimo feedback:

- superficie completamente piatta, come una lastra di vetro o metallo;
- verde metallizzato con molte sfumature;
- riflessi molto vivi, brillanti e lucidi, non opachi;
- nessuna linea orizzontale o orizzonte visibile;
- nessun rilievo, piega, onda, oggetto o forma tridimensionale;
- sulla schermata iniziale devono comparire soltanto `ATTIVA L'AUDIO` e il `+` per entrare;
- da questa superficie dovra' poi emergere gradualmente l'intera foresta.

Le immagini provate finora sono riferimenti di iterazione, non asset approvati: la prima aveva colori e riflessi convincenti ma troppe forme e una linea orizzontale; le successive erano piu' piatte ma troppo opache.

## Pagina Soglia

Status: **APPROVED / FROZEN / PRIMARY**

- Checkpoint: [SOGLIA-v62-FROZEN-CHECKPOINT-2026-09-15.md](./SOGLIA-v62-FROZEN-CHECKPOINT-2026-09-15.md)
- Baseline: [Il-Suono-Organizzato-Soglia-v62-FROZEN-2026-09-10.html](./Il-Suono-Organizzato-Soglia-v62-FROZEN-2026-09-10.html)
- Regola: ogni nuova prova sulla Soglia deve partire da questa v62 e diventare una candidate separata.

## Altre baseline conservate nel repository

- Home storica halftone: `Il-Suono-Organizzato-HOME-v10-HALFTONE-FROZEN-2026-09-10.html`; conservata come archivio, **non** e' la baseline corrente della HOME 1.
- Le versioni `works-*`, `v*.html` e `*-candidate.html` sono prototipi/candidate: non considerarli automaticamente approvati senza un checkpoint esplicito.

## Regole di continuita'

1. Non ricostruire da memoria una pagina frozen: aprire il file HTML canonico.
2. Non sovrascrivere una baseline frozen durante le prove: creare una nuova candidate.
3. Congelare una nuova versione solo dopo approvazione esplicita di William.
4. Ogni nuovo stato approvato deve essere registrato su GitHub con file frozen e checkpoint aggiornato.
5. Nel dubbio, mantenere separati: `APPROVED / FROZEN`, `CANDIDATE`, `EXPLORATION`.

## Prompt minimo per la nuova chat

> Continuiamo Il Suono Organizzato — Website Lab. Leggi nel repository `wshwlmLab/iso-website-previews` il file `WEBSITE-LAB-CANONICAL-HANDOFF-2026-09-15.md` e i checkpoint che indica. Non modificare le versioni frozen: crea candidate separate. Ripartiamo dall'esplorazione aperta della HOME 2.

Per lavorare sulla Pagina Soglia, usare invece il prompt minimo contenuto in `SOGLIA-v62-FROZEN-CHECKPOINT-2026-09-15.md`.

## Infrastructure update — 2026-09-16

- Operational handoff: [WEBSITE-LAB-INFRASTRUCTURE-HANDOFF-2026-09-16.md](./WEBSITE-LAB-INFRASTRUCTURE-HANDOFF-2026-09-16.md)
- Stable workflow: [WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md](./WEBSITE-LAB-STABLE-WORKFLOW-2026-09-16.md)
- HOME 2 portable canonical: [canonical/home-2/index.html](./canonical/home-2/index.html)
- HOME 2 assets are now stored in GitHub with relative references; Vercel remains blocked because the connected team exposes zero projects.
