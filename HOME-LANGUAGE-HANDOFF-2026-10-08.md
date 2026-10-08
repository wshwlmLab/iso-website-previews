# Home — selettore italiano/inglese

Prova basata sulla Home 2 Terra Viva con rocce a −6 dB e ingresso di 5 secondi, commit `299239621f0edc663a32d1e92f6230a89e49532f`, e sulla Home 1 con controlli comuni approvati del 7 ottobre. Audio, immagini, shader, movimenti, meter e punto di attivazione non cambiano.

Sulla schermata iniziale il selettore è una scritta senza bordo, con il centro orizzontale esattamente sopra il centro del più. Centro verticale a `5.88vh`, identico al pulsante audio. Font ufficiale New Heterodox Mono Book: lo stesso file della Soglia, peso 500, dimensione e tracking condivisi con il pulsante, comprese le regole per telefono. Il file è servito e precaricato da `shared/fonts/NewHeterodoxMono-Book.otf`, blob Git `d4a4ef069fb78c774b9d257a9b74ca4a076eb667`, con licenza OFL accanto. Sotto 500 px il pulsante audio si sposta solo quanto serve a evitare la sovrapposizione, mantenendo altezza e tipografia; il meter conserva il suo punto centrale. Puntatore normale, mano sui controlli cliccabili. Il selettore svanisce insieme al pulsante audio quando entra l’installazione.

| Lingua | Attivazione audio | Lingua alternativa |
|---|---|---|
| Italiano | ATTIVA L’AUDIO | ENGLISH |
| Inglese | SOUND ON | ITALIANO |

Il cambio lingua non avvia l’audio, non riavvia l’installazione e non ricarica la pagina. Aggiorna anche le etichette accessibili di meter e più.

## Contratto condiviso con la Soglia e le altre pagine

Il modulo è `shared/iso-language.js`. Valori ammessi: `it`, `en`. Precedenza all’apertura: parametro URL `lang`, scelta salvata, italiano. La scelta è salvata in `localStorage['iso-language']`; il più porta alla destinazione già esistente aggiungendo `?lang=it` o `?lang=en`. Questo parametro trasferisce la scelta anche fra le preview con origini differenti. Lo stato URL viene aggiornato con `history.replaceState` conservando gli altri parametri.

API: `window.ISOLanguage.get()`, `.set('it'|'en')`, `.subscribe(callback)`, `.href(url)`; evento `iso:languagechange`, con `event.detail.language`. `document.documentElement.lang` viene aggiornato. Lo storage bloccato non impedisce il cambio lingua.

Per la Soglia: usare lo stesso modulo e valori, collegando il cambio su ROME, ITALY a `ISOLanguage.set()`. La traduzione dei testi delle altre pagine è di competenza delle rispettive pagine. Questa prova modifica i controlli Home e trasmette la scelta alla Soglia; non modifica la Soglia mentre la sua prova lingua è in lavorazione nell’altra chat.

Il modulo `bindHome(root)` aggiunge il selettore a qualsiasi installazione che usa `.audio-label`, `.meter-hit` e `.plus`; il layout dei due meter dell’opera non viene toccato. I controlli di questa prova sono in `candidates/home-shared/language-controls-2026-10-08/`. Per le altre installazioni usare questi controlli dopo il modulo lingua.

Verifica Chromium 138, larghezze 1440, 390 e 320 px: font e tracking identici, allineamento verticale entro mezzo pixel, nessuna sovrapposizione dei controlli. Italiano → inglese → italiano, persistenza al rientro senza parametro URL, `lang` trasmesso dal più, nessuna attivazione audio dal selettore. Dopo Attiva l’audio il selettore svanisce e le etichette del mute seguono la lingua. Nessun errore JavaScript; configurazione rocce −6 dB / 5 secondi conservata.
