# Soglia — verifica performance, 3 ottobre 2026

William ha segnalato audio interrotto e successivamente un ingresso fermo al 50%. La percentuale e l'intera schermata di caricamento sono rimosse. La prova conserva l'introduzione tipografica della v73 durante la preparazione dei media; non inserisce indicatori durante l'eraser.

Non sono disponibili i log del browser di William né una prova d'ascolto automatica di quel dispositivo. Il test del motore gira in Node/V8 con DOM simulato: misura il codice e le operazioni, non gli FPS di Chrome né l'uscita sonora. Non si attribuisce quindi con certezza un'unica causa all'interruzione audio segnalata.

## Media effettivamente usati

Il manifest attivo e i tre audio sono stati riletti da Cloudflare R2 con l'Origin della Soglia. Tutte le risposte sono HTTP 200, con CORS `*`; SHA-256 coincide con il manifest e con i file decodificati localmente. La Soglia usa già MP3; il vecchio `meter-test.wav` non è una sorgente attiva.

| Audio | Formato | Byte su R2 | Durata decodificata con FFmpeg | PCM stereo a 48 kHz |
| --- | --- | ---: | ---: | ---: |
| River | MP3, stereo, 48 kHz | 780.429 | 47,989 s | 17,57 MiB |
| Endless Ascent | MP3, stereo, 48 kHz | 2.699.704 | 192,432 s | 70,47 MiB |
| EXT Sciola | MP3, stereo, 48 kHz | 283.808 | 17,102 s | 6,26 MiB |

I tre file si decodificano integralmente senza errori: circa 3,76 MB scaricati e 94,31 MiB decodificati. La giunzione di un secondo viene preparata nello stesso buffer, senza una seconda copia PCM integrale. Verifiche R2 tramite `ISO — Cartoline R2 — upload e verifica`, esecuzioni manuali 1705–1708. Nessuna modifica a media o CORS è stata necessaria.

## Difetti e interventi

1. **Handshake fragile dell'iframe.** La precedente versione confrontava l'intero URL figlio con la stringa richiesta. Un URL normalizzato o con un hash aggiuntivo veniva ignorato. I tre audio potevano finire, mentre le tre immagini non venivano richieste: 3 risorse su 6, quindi 50%. Il test riproduce questa condizione, senza affermare che fosse l'URL del browser di William. Il nuovo handshake usa le funzioni effettivamente presenti nella pagina.
2. **Preparazione e uscita audio accoppiate.** La preparazione usa ora `OfflineAudioContext` a 48 kHz. Il contesto di riproduzione viene creato e sbloccato nel primo gesto dell'introduzione, con frequenza esplicita e latenza `balanced`. Non si usa un contesto soggetto all'autoplay come decoder di caricamento.
3. **Lavoro inutile nell'eraser.** Il motore scansionava il rettangolo delle passate diagonali e calcolava due seni anche per celle troppo distanti. Ora limita il rettangolo per riga e scarta le celle geometricamente impossibili prima del rumore del bordo. Conserva gli stessi pixel, cooldown, contatori e guard rail. Le tabelle si aggiornano solo quando cambiano i dati corrispondenti; 100 campioni coalescenti non richiedono più 100 letture DOM della posizione.
4. **Geometria SVG letta a ogni frame.** I quattro angoli del quadrato approvato sono letti una volta sola. Posizioni e direzioni delle lettere vengono calcolate aritmeticamente: zero query SVG durante un frame e una trasformazione per lettera invece di tre attributi. La cornice comincia a muoversi quando diventa visibile.
5. **Font dipendenti da un CDN.** I file originali sono ora serviti dal sito, con licenza OFL. Git blob SHA verificati: Book `d4a4ef069fb78c774b9d257a9b74ca4a076eb667`, Bold `595926171b9c57d6897f1a96634625dcc7c0560e`. Cambia soltanto il percorso.

## Risultati automatici

- Vecchio/nuovo motore, 3 e 5 layer: tutte le celle, i pixel bianchi, i passi, i conteggi e i cooldown coincidono dopo 60 frame con percorsi curvi, veloci e fuori dal modulo.
- Almeno tre giri completi con 3 e 5 layer; conteggi del suono confrontati con i pixel visibili. Soglie 99,5%/90% e guard rail di 60 px conservati.
- Stress test di otto campioni diagonali veloci in un modulo da 430 px: circa 350 ms prima e 69 ms dopo nel test Node VM; circa 93% di calcoli del seno in meno. Questi tempi non rappresentano il browser di William né un obiettivo FPS.
- Cornice: posizioni del quadrato identiche a precisione numerica; zero letture SVG durante il frame e una trasformazione per lettera. Il modello non simula il costo del rendering reale.
- Introduzione visibile mentre l'ultimo file è in preparazione; URL figlio normalizzato accettato; sblocco audio dal gesto durante l'introduzione; cinque loop avviati una sola volta.
- File incompleto rifiutato prima della decodifica; recupero del solo asset danneggiato senza ricaricare l'introduzione. Errore del manifest recuperabile.
- Dieci cicli di interazione dopo aver disabilitato la rete nel test: nessuna nuova richiesta, decodifica o riavvio dei loop. Fade e mute restano di un secondo.

Comandi: `node qa/verify-preload.mjs dist`, `node qa/verify-v73-audio.mjs dist`, `node qa/verify-eraser-performance.mjs dist`.

La verifica dei font è salvata alla radice del progetto personale di William in n8n: [ISO — Soglia — original font verification](https://autonomous-business-lab.app.n8n.cloud/workflow/0ZKWVZmJAPYiVorn). È manuale e di lettura, senza credenziali o webhook di produzione; legge tre blob pubblici fissi e verifica gli hash.

Diagnostica locale: `window.ISOAudioMeter.loading.assets`, `diagnostics`, `audioState`, `experienceReady` e `tracks`. Nessun dato del visitatore viene trasmesso. Se l'audio si interrompe ancora nella preview, questi dati permettono di distinguere asset non preparati, stato del dispositivo e lavorazioni lunghe del thread principale.
