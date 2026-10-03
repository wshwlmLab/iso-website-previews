# Soglia v73 — cartolina R2 con caricamento completo, fade e crossfade

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

L'ingresso è bloccato da una schermata “Caricamento…” con progresso reale. Tutte e tre le immagini e tutti e tre gli audio vengono scaricati integralmente e verificati prima dell'ingresso. La pagina aspetta anche la decodifica delle immagini, i font, i canvas dell'eraser e la geometria dell'animazione. Il 100% compare solo quando l'intera esperienza è pronta; l'animazione introduttiva parte in quel momento, senza consumarsi dietro l'attesa. Puntatore, tastiera e meter sono bloccati fino a quel momento.

Un solo loader e una sola cache sono condivisi fra pagina e iframe; anche il manifest viene richiesto una volta sola. Il progresso segue i byte ricevuti e la preparazione dei singoli media, senza timer che simulano l'avanzamento. Errori HTTP, risposte incomplete, impronte SHA-256 diverse dal manifest o 45 secondi senza nuovi dati mantengono chiuso l'ingresso. “Riprova” conserva i media validi e scarica nuovamente quelli mancanti o danneggiati. Non esiste un ripiego silenzioso sui vecchi file di prova.

I tre audio vengono scaricati in parallelo e decodificati uno alla volta mentre l'ingresso è ancora chiuso. Il primo gesto sblocca l'audio; i tre buffer già preparati partono allo stesso istante e continuano in loop, anche quando la foto è invisibile o il meter è in mute. Non vengono riavviati durante l'eraser. Dopo l'ingresso non ci sono altri download o decodifiche per queste risorse.

Il volume obiettivo di ogni file resta la frazione esatta dei pixel visibili della sua foto. Ogni cambiamento usa una rampa di un secondo, continua anche quando il mouse cambia velocemente direzione. Due foto che si sostituiscono producono due rampe complementari. Il mute mantiene il fade di un secondo e non arresta i loop.

La chiusura del loop ha una sovrapposizione di un secondo tra coda e testa, con curva coseno e pesi che sommano a uno. La coda viene preparata direttamente nel buffer PCM decodificato; `loopStart` e `loopEnd` producono lo stesso periodo e la stessa giunzione senza allocare una seconda copia di tutto l'audio. Il browser ripete il buffer senza affidarsi a timer JavaScript o riavviare un elemento audio. Il periodo è quindi la durata originale meno un secondo. Per audio molto brevi la sovrapposizione è limitata a un quarto della durata. I file originali rimangono integri su R2 e nel backup.

Per aggiungere una cartolina, caricare una nuova cartella con immagini, audio e manifest. Ogni elemento di `layers` abbina una foto a un audio; tre e cinque layer usano lo stesso motore. Aprire la pagina con `?cartolina=<id>&versione=v1`. Per cambiare i media senza sovrascrivere una prova approvata, usare una nuova versione, ad esempio `v2`.

Il dominio pubblico R2 attuale è quello di prova già configurato. Quando sarà collegato un dominio media definitivo, cambiare soltanto `origin` in `cartolina-config.js` e mantenere CORS per GET/HEAD. Nessuna credenziale Cloudflare è presente nella pagina.

Le fotografie caricate sono estratte senza modifiche dalla v73. La grafica, la cornice e il movimento della scritta restano quelli approvati; cambia il momento di avvio, subordinato al caricamento completo. Le soglie dell'eraser restano 99,5% per il primo velo e 90% per i passaggi successivi; il guard rail resta 60 px.

Verifiche: sintassi JavaScript; CSS approvato e movimento della scritta invariati; almeno tre giri completi con tre e cinque layer; conteggi dei pixel confrontati con tutte le celle del viewport; fade di un secondo; continuità fra i campioni alla chiusura dei loop; avvio simultaneo e nessun riavvio al mute. I test del nuovo ingresso usano il codice reale del loader, dell'audio e della preparazione dell'iframe in un ambiente simulato: download lento, ultima immagine non ancora decodificata, font in attesa, file HTTP-200 incompleto, recupero del solo file danneggiato, errore e recupero del manifest, dieci interazioni dopo aver disabilitato la rete. I sei media pubblici R2 sono stati riletti e confrontati byte per byte tramite SHA-256 durante il precedente upload; tipi MIME e CORS sono corretti. Non è stato possibile eseguire una prova del browser/ascolto in questo ambiente; la preview è disponibile per l'ascolto manuale di William.

Nel progetto Sites: `node qa/verify-v73-audio.mjs dist` e `node qa/verify-preload.mjs dist`.

La regola comune per il resto del sito è salvata in `SITE_EXPERIENCE_RULES.md`, con `shared/experience-loader.js` riutilizzabile per le altre pagine. Per ora è applicata alla Soglia candidata; le altre pagine la adotteranno nei successivi interventi.

La procedura n8n di upload e verifica è nel progetto personale di William, alla radice: `ISO — Cartoline R2 — upload e verifica`. È inattiva e viene eseguita manualmente tramite il collegamento n8n; nessun webhook di produzione è stato pubblicato. L'importazione integrale di Endless Ascent è stata eseguita con una procedura separata esclusivamente manuale, con sorgente e chiave R2 fisse.

Stato: PROVA, in attesa dell'approvazione di William.
