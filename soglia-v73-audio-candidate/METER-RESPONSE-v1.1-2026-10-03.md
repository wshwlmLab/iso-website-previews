# Official Meter v1.1 — 3 ottobre 2026

Il profilo comune aumenta del 20% la velocità di risposta visiva del meter, sia
in salita sia in discesa. Usa lo stesso filtro esponenziale della v1: attacco
`0.032 × 1.2` per millisecondo e rilascio `0.0075 × 1.2` per millisecondo.
Il movimento continua a dipendere dal tempo trascorso, non dal frame rate.

La sorgente comune è `shared/iso-meter-response.js` nel repository
`wshwlmLab/iso-website-previews`. Le pubblicazioni Sites distribuiscono una
copia identica come `dist/iso-meter-response.js`; nessun parametro di risposta
deve essere duplicato negli adattatori delle pagine. Caricare il modulo prima
del meter e chiamare `window.ISOMeterResponse.advance(valore, target, dtMs)`.
Nuove pagine che adottano il meter ufficiale devono usare questo profilo.

Il profilo è adottato da WORKS, dalla candidate WORKS con trailer YouTube,
dalla Soglia corrente e da Blog. Blog resta a zero perché la sua pagina corrente
non ha una sorgente audio: non viene introdotta un'animazione simulata.
Le prove degli articoli Horeg, Gumleaf e ICK e la vecchia prova Blog non hanno
un meter e non richiedono modifiche. Le Home archiviate rimangono snapshot;
le loro successive versioni devono importare il profilo comune.

Restano invariati grafica, 2 canali/16 segmenti, calibrazione RMS, sorgenti
audio, mute, volume, player, cornice, contenuti e animazioni della pagina.
I file e gli archivi frozen della v1 non vengono modificati.

Verifica: `node tests/iso-meter-response.cjs dist/iso-meter-response.js`.
