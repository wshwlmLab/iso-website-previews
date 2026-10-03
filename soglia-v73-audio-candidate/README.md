# Soglia v73 — prova audio e performance senza schermata di caricamento

Prova basata sulla v73 approvata, commit Sites originale `d0a0349082d954425ff6356b5306c164ad014135`. La v73 definitiva resta intatta nel ramo GitHub `frozen/soglia-v73`, commit `1fd73843345ae54ccc74e3ed259c0f626883ebf3`.

La pagina carica realmente sia le immagini sia gli audio da Cloudflare R2. Il bucket esistente è `il-suono-organizzato-audio`; ogni cartolina ha un contenitore logico indipendente:

```text
cartoline/<id>/v1/manifest.json
cartoline/<id>/v1/images/01.jpg
cartoline/<id>/v1/images/02.jpg
cartoline/<id>/v1/images/03.jpg
cartoline/<id>/v1/audio/river.mp3
cartoline/<id>/v1/audio/endless-ascent.mp3
cartoline/<id>/v1/audio/sciola.mp3
```

Cartolina attuale: `soglia-prova`, versione `v1`. Manifest pubblico: https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev/cartoline/soglia-prova/v1/manifest.json

| Foto originale | Audio provvisorio |
| --- | --- |
| 1 | River |
| 2 | Endless Ascent |
| 3 | EXT Sciola |

La precedente schermata di caricamento con percentuale è stata rifiutata e rimossa. La scritta e l'introduzione approvate restano visibili e interattive mentre tutti i media vengono scaricati, verificati e preparati. La transizione manuale verso la cartolina attende le risorse pronte prima dello svelamento; nessun indicatore compare durante l'eraser.

Un solo loader e una sola cache sono condivisi fra pagina e iframe. La preparazione audio usa un decoder offline a 48 kHz. Il contesto che riproduce il suono viene aperto e sbloccato nel primo gesto dell'introduzione; i buffer preparati partono insieme a volume zero e continuano in loop, senza riavviarsi nei cambi foto o nel mute. Dopo l'ingresso nella cartolina non ci sono nuovi download o decodifiche.

Il confronto rigido dell'URL dell'iframe è stato rimosso: un URL normalizzato non deve impedire il caricamento delle immagini. Il loader verifica HTTP, completezza e SHA-256; un recupero conserva le risorse valide senza ricaricare l'introduzione. La diagnostica è locale, senza interfaccia aggiuntiva o invio a servizi esterni.

Il volume obiettivo di ogni file resta la frazione esatta dei pixel visibili della sua foto. Ogni cambiamento usa una rampa di un secondo, continua anche quando il mouse cambia velocemente direzione. Due foto che si sostituiscono producono due rampe complementari. Il mute mantiene il fade di un secondo e non arresta i loop.

La chiusura del loop ha una sovrapposizione di un secondo tra coda e testa, con curva coseno e pesi che sommano a uno. La coda viene preparata direttamente nel buffer PCM decodificato; `loopStart` e `loopEnd` producono lo stesso periodo e la stessa giunzione senza allocare una seconda copia di tutto l'audio. Il browser ripete il buffer senza affidarsi a timer JavaScript o riavviare un elemento audio. Il periodo è quindi la durata originale meno un secondo. Per audio molto brevi la sovrapposizione è limitata a un quarto della durata. I file originali rimangono integri su R2 e nel backup.

Per aggiungere una cartolina, caricare una nuova cartella con immagini, audio e manifest. Ogni elemento di `layers` abbina una foto a un audio; tre e cinque layer usano lo stesso motore. Aprire la pagina con `?cartolina=<id>&versione=v1`. Per cambiare i media senza sovrascrivere una prova approvata, usare una nuova versione, ad esempio `v2`.

Il dominio pubblico R2 attuale è quello di prova già configurato. Quando sarà collegato un dominio media definitivo, cambiare soltanto `origin` in `cartolina-config.js` e mantenere CORS per GET/HEAD. Nessuna credenziale Cloudflare è presente nella pagina.

Le fotografie caricate sono estratte senza modifiche dalla v73. La grafica e il movimento della scritta restano quelli approvati. La cornice mantiene lo stesso percorso e la stessa velocità con calcoli aritmetici; il motore eraser elimina lavoro inutile senza cambiare pixel o decisioni del guard rail. I font identici agli originali sono serviti dal sito, con la licenza OFL. Le soglie dell'eraser restano 99,5% per il primo velo e 90% per i passaggi successivi; il guard rail resta 60 px.

Le verifiche e i limiti della diagnosi sono in [PERFORMANCE.md](PERFORMANCE.md): formati MP3 e integrità R2 controllati, decodifica integrale senza errori, riproduzione della condizione che può fermare la vecchia percentuale al 50%, equivalenza pixel per pixel con 3/5 layer, stress del motore, giunzioni e fade, preparazione indipendente dall'autoplay, recupero e assenza di rete durante l'eraser. I test usano Node/V8 e DOM simulato; non rappresentano un ascolto nel browser di William.

Nel progetto Sites: `node qa/verify-v73-audio.mjs dist`, `node qa/verify-preload.mjs dist` e `node qa/verify-eraser-performance.mjs dist`.

La regola comune del sito in `SITE_EXPERIENCE_RULES.md` è aggiornata alla decisione di William: prima performance e continuità, poi progettazione di eventuali attese; nessuna percentuale o spinner automatico. `shared/experience-loader.js` è riutilizzabile e non crea interfacce. Le altre pagine adotteranno la regola nei successivi interventi.

La procedura n8n di upload e verifica è nel progetto personale di William, alla radice: `ISO — Cartoline R2 — upload e verifica`. È inattiva e viene eseguita manualmente tramite il collegamento n8n; nessun webhook di produzione è stato pubblicato. L'importazione integrale di Endless Ascent è stata eseguita con una procedura separata esclusivamente manuale, con sorgente e chiave R2 fisse.

Stato: PROVA, in attesa dell'approvazione di William.
