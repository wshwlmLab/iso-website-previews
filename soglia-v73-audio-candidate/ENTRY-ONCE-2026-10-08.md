# Soglia — introduzione soltanto al primo ingresso

Decisione di William dell'8 ottobre 2026: l'introduzione con le frasi che si scompongono e ritornano compare al primo ingresso della visita. Quando si torna alla Soglia dalla navigazione interna, si apre direttamente la schermata con eraser, FILM, FRAGMENT, BLOG e ABOUT.

La visita è quella della scheda del browser. `sessionStorage` conserva `iso.soglia.entered = 1` quando la schermata dell'eraser è effettivamente raggiunta. La chiave resta la stessa dopo aggiornamenti del sito e cambi di cartolina. Ricaricamenti e ritorni tramite la cronologia nella stessa visita saltano l'introduzione; una nuova visita può mostrarla nuovamente. Non viene utilizzato un cookie permanente.

`dist/site-visit.js` espone `window.ISOSiteVisit.hasEnteredSoglia()` e `markSogliaEntered()`. Quando assembleremo le pagine, tutte devono usare lo stesso dominio e conservare questo stato: i collegamenti di ritorno puntano alla Soglia normale, che decide da sola come entrare. FRAGMENT rimane una destinazione distinta dalla Soglia. Le altre esperienze non vengono collegate o sostituite in questo intervento.

Il ritorno diretto non mostra né anima nuovamente la frase iniziale. Mostra le voci già intere e attiva l'eraser soltanto dopo la preparazione integrale di immagini, audio e font. Nessuno spinner o indicatore aggiunto. Il completamento normale della prima introduzione e l'ingresso diretto condividono lo stesso punto di attivazione della cartolina e del suo bordo. Il ritorno tramite la cache della cronologia del browser ripristina anche le voci e la cartolina eventualmente lasciate sfumate dalla navigazione precedente, senza riavviare i loop.

I fade al clic, il puntino, il meter, i loop audio, le soglie e il guard rail restano quelli approvati. Il ramo `frozen/soglia-2026-10-07`, commit `8d9481cde91ad166aeb78ab2b7b66bd614519ddc`, conserva intatta la versione precedente.

Verifiche automatiche: `node qa/verify-entry-once.mjs`, `node qa/verify-menu-exit.mjs`, `node qa/verify-preload.mjs dist`, `node qa/verify-v73-audio.mjs dist`. Coprono primo ingresso, ritorno con una nuova istanza della pagina, ricaricamento, cache della cronologia, preparazione ritardata di font/immagini/audio, nuova visita e memoria locale quando sessionStorage non è disponibile.
