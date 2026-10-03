# Il Suono Organizzato — regola di ingresso nelle esperienze

Una pagina interattiva inizia soltanto quando tutte le risorse necessarie alla sua esperienza sono scaricate, verificate e preparate. William ha stabilito questa regola il 3 ottobre 2026, a seguito delle interruzioni durante la cartolina Soglia. La stessa regola vale per le successive modifiche alle altre pagine, inclusa Works.

Prima dell'ingresso:

- Scaricare integralmente tutte le immagini e tutti gli audio della cartolina, anche quelli che saranno svelati nei giri successivi. Dichiarare l'intero elenco delle risorse all'inizio, senza caricare nuovi layer durante l'interazione.
- Verificare la risposta HTTP e la completezza; verificare SHA-256 quando il manifest contiene l'impronta del file.
- Decodificare gli audio, preparare le giunzioni dei loop e conservare i buffer in memoria. Decodificare le immagini e preparare i canvas dell'eraser. Attendere i font e preparare la geometria delle animazioni.
- Tenere bloccati puntatore, tastiera, meter e animazione introduttiva finché manca anche una sola risorsa necessaria. Mostrare soltanto “Caricamento…” con il progresso reale. Il 100% è riservato alla disponibilità dell'intera esperienza, inclusa la preparazione.
- Se un download fallisce, scade o è incompleto, mantenere chiuso l'ingresso e mostrare “Riprova”. Conservare i file validi e recuperare quelli mancanti; non avviare una versione parziale.

Dopo l'ingresso, l'eraser e i loop devono usare esclusivamente le risorse già preparate: nessun nuovo download, nessuna nuova decodifica e nessun riavvio dei loop nei passaggi fra foto o nel mute. Lo sblocco dell'audio avviene nel primo gesto dell'utente, come richiesto dal browser; non è un'attesa di rete. Eventuali video necessari all'esperienza devono avere una strategia equivalente di preparazione completa, prima di abilitare l'ingresso: `preload="auto"` o `canplay` da soli non garantiscono questo requisito.

Implementazione riutilizzabile: [`shared/experience-loader.js`](shared/experience-loader.js). La cartolina attuale la usa in [`soglia-v73-audio-candidate/dist/experience-loader.js`](soglia-v73-audio-candidate/dist/experience-loader.js), con un'unica cache condivisa fra la pagina e il suo iframe. Il loader non contiene credenziali. I media restano su Cloudflare R2 e le cartoline sono versionate per evitare sovrascritture accidentali.

Verifiche minime per adottare il meccanismo in una nuova pagina: connessione lenta, ultimo file ritardato, font in attesa, risposta incompleta, errore iniziale del manifest, recupero con “Riprova”, interazione senza rete dopo l'ingresso. Le verifiche automatiche della Soglia si trovano in `soglia-v73-audio-candidate/qa/verify-preload.mjs` e `qa/verify-v73-audio.mjs`.

La regola è già applicata alla prova audio della Soglia basata sulla v73. Le versioni FROZEN approvate restano intatte; le altre pagine adotteranno lo stesso controllo nei successivi interventi.
