# Soglia — isolamento dell'interruzione audio, 3 ottobre 2026

**Riscontro di William, 3 ottobre 2026, ore 16:41 Europe/Rome:** ha ascoltato le prove 1 e 2 e riferisce che entrambe funzionano bene: Cloudflare con player HTML precedente e Cloudflare con player PCM attuale. La prova 3 con audio locali non è stata eseguita. Il sintomo non si è ripresentato nelle due prove ascoltate. La modalità scelta per proseguire è Cloudflare con il player PCM attuale, che mantiene il crossfade dei loop e i fade di un secondo.

Il riscontro riguarda il sorgente Sites `5130fb2cf509276837b70d7305bdc215a0c912b6`, salvato su GitHub in `9a12e686f1662ef1df91faa1db43e2666dd6c4c5`. Il risultato conferma il funzionamento di questa prova sul dispositivo dell'utente; non identifica con certezza la causa del blocco precedente. I test Node/V8 restano controlli di integrità e stato con API simulate, distinti dall'ascolto riferito.

## Il confronto storico aveva più variabili

- `688dd3d5abb2ae6bd0c285b0f9adca389018fb77`: tre elementi HTML audio con MP3 locali, loop nativo e gain `setTargetAtTime`.
- `02cb1d5ea498428c8d0d157edc062c6a5b2c7fd7`: introduzione del manifest Cloudflare, ma contemporaneamente passaggio a file completamente decodificati, sorgenti `AudioBufferSourceNode`, crossfade della coda e fade lineari continuamente riprogrammati.
- Nello stesso passaggio Endless Ascent è stato recuperato completo: da 2.097.152 byte a 2.699.704 byte. La precedente copia locale era troncata; non è una base corretta per confrontare gli asset attuali.

Questi dati non provano che Cloudflare sia innocente o responsabile. Impediscono di attribuire il cambiamento a una sola variabile senza un nuovo confronto.

## Due prove della stessa pagina

Cloudflare rimane l'origine predefinita e quella del manifest e delle immagini. Il parametro `audio_origine=locale` sceglie solamente le copie dei tre MP3 incluse nel sito. Le copie corrispondono byte per byte ai SHA-256 del manifest Cloudflare; stesso decoder, PCM, crossfade, gain, introduzione e loop dell'eraser.

- Cloudflare: https://iso-soglia-real-meter.area-di-lavo-9208.chatgpt.site/?audio_origine=cloudflare
- Copie sul sito: https://iso-soglia-real-meter.area-di-lavo-9208.chatgpt.site/?audio_origine=locale

Aprire una prova per volta. Due pagine aperte insieme riprodurrebbero entrambe gli stessi suoni, alterando l'ascolto. Entrambe preparano completamente le risorse prima dello svelamento e non effettuano richieste o nuove decodifiche durante il loop. Le immagini restano su Cloudflare anche nella prova audio locale: questo confronto isola l'origine dei soli audio.

Se il problema è presente in entrambe, la provenienza degli MP3 non basta a spiegarlo. Se emerge solo nella prova Cloudflare, vanno acquisiti lo stato di preparazione, le richieste e gli errori di quella prova. William ha confermato l'ascolto della modalità PCM con Cloudflare; il confronto con copie locali non è stato necessario per scegliere la modalità da mantenere e non è stato ascoltato.

È disponibile anche il confronto con il player HTML precedente:

https://iso-soglia-real-meter.area-di-lavo-9208.chatgpt.site/?audio_origine=cloudflare&audio_motore=html

Scarica integralmente i medesimi MP3 da Cloudflare, ne verifica gli hash e li assegna come Blob locali a tre/cinque player HTML. I player sono preparati prima dello svelamento e collegati agli stessi gain e meter: non effettuano streaming dalla rete durante l'eraser. L'avvio concorrente è protetto, e le interazioni successive non riavviano le tracce. Non viene allocato il PCM completo in JavaScript.

**Limite intenzionale del confronto HTML:** usa il loop nativo del file originale, senza il crossfade della coda. Per confrontare interruzioni durante il corpo dei suoni è utile; un eventuale salto al punto di giunzione del file non prova un difetto di rete o dispositivo. Non è la nuova modalità definitiva. La modalità PCM con crossfade resta quella predefinita. Se HTML è fluido e PCM si inceppa, va indagato il percorso PCM e il dispositivo prima di cambiare Cloudflare.

## Fade con punto di ripartenza esplicito

La prova aggiornata elimina l'uso ripetuto di `cancelAndHoldAtTime`. Quando arriva un nuovo volume, calcola il punto dell'ultima rampa sul clock audio, elimina i soli eventi futuri, ancora quel valore con `setValueAtTime` e programma l'arrivo dopo un secondo. La funzione non dipende dalla lettura di `AudioParam.value` a ogni interruzione. Mute e tre/cinque foto hanno inviluppi indipendenti; i loop non vengono fermati o riavviati.

È una modifica verificata alla gestione dei fade, non una causa accertata dell'interruzione sul dispositivo di William. Le tre prove usano gli stessi nuovi fade; il passaggio alle sorgenti PCM non è stato annullato nella modalità predefinita.

## Diagnostica e verifiche

`window.ISOAudioMeter.capture()` produce un oggetto locale con origine audio, motore, preparazione, tracce, errori, stato del contesto e latenza. Include le statistiche di underrun se il browser espone `AudioContext.playbackStats`; l'assenza dell'API non blocca la pagina. Sono registrati anche eventi di errore del dispositivo e fine inattesa delle sorgenti; il player HTML registra `waiting`, `stalled` e `error`. Nessuna telemetria viene trasmessa.

Controlli eseguiti:

```sh
node qa/verify-preload.mjs dist
node qa/verify-v73-audio.mjs dist
node qa/verify-audio-fades.mjs dist
```

Copertura: URL differenti solo per l'audio; hash degli MP3 locali; nessuna rete dopo preparazione; tre/cinque loop continui; player HTML senza decoder PCM e senza doppio avvio; mute senza riavvio; inversioni del fade, getter non aggiornato, completamento, durata zero, 3.000 cambi allo stesso clock; mantenimento delle immagini e dell'introduzione. L'eraser e la cornice non vengono modificati in questa indagine.

La v73 definitiva nel ramo e nella cartella Frozen resta invariata. Questa è la prova audio con funzionamento confermato da William; la v73 definitiva originale resta distinta.
