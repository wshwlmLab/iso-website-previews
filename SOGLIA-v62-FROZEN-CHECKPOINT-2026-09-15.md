# Il Suono Organizzato — Pagina Soglia — checkpoint v62

Status: **APPROVED / FROZEN / PRIMARY**

Questa e' la baseline corrente della Pagina Soglia. Ogni nuova lavorazione deve partire esclusivamente dal file frozen indicato qui sotto e diventare una nuova candidate; il frozen non va sovrascritto.

## Sorgenti canoniche

- Baseline: [Il-Suono-Organizzato-Soglia-v62-FROZEN-2026-09-10.html](./Il-Suono-Organizzato-Soglia-v62-FROZEN-2026-09-10.html)
- Candidate approvata, conservata per tracciabilita': [v62-from-v61-remove-cursor-toggle-candidate.html](./v62-from-v61-remove-cursor-toggle-candidate.html)
- I due file sono identici bit-per-bit.
- Blob canonico: `64db5ff9e48d47907a5557758b832a4506b17621`.

## Stato approvato

- Sequenza fotografica erase/reveal: bianco → foto 1 → foto 2 → foto 3.
- Foto 1 → foto 2: sblocco al 99% e protezione locale di 60 px dalla superficie ancora bianca.
- Foto 2 → foto 3: protezione locale ampliata a 60 px.
- Eraser ad alta precisione nei movimenti rapidi e ultimo tratto elaborato al rilascio.
- Rombo 20 × 20 px mantenuto.
- HOME, BLOG, WORKS e ABOUT usano il ribaltamento istantaneo dell'intera parola, senza easing o stagger.
- Cursore/specchietto rosso visibile; selettore `1 clear / 2 red` rimosso.

## Decisione sulle transizioni fra pagine

Le transizioni pagina→pagina non sono ancora frozen e non fanno parte della v62. Verranno progettate e collaudate fuori da Webflow quando almeno due pagine adiacenti avranno struttura e interazioni stabili; il motore condiviso verra' poi integrato nel sito Webflow definitivo.

## Regole operative

1. Non ricostruire l'erase/reveal a memoria: aprire il sorgente frozen.
2. Non modificare o sovrascrivere la v62 frozen.
3. Applicare soltanto il diff richiesto su una nuova candidate.
4. Verificare la candidate nel browser.
5. Solo William puo' dichiarare una nuova versione APPROVED / FROZEN.

## Prompt minimo per ripartire in una nuova chat

> Continuiamo a lavorare sulla Pagina Soglia di Il Suono Organizzato. Leggi nel repository `wshwlmLab/iso-website-previews` prima `WEBSITE-LAB-CANONICAL-HANDOFF-2026-09-15.md`, poi `SOGLIA-v62-FROZEN-CHECKPOINT-2026-09-15.md`. Riparti esclusivamente da `Il-Suono-Organizzato-Soglia-v62-FROZEN-2026-09-10.html`, non modificare il frozen e crea una nuova candidate per ogni prova.
