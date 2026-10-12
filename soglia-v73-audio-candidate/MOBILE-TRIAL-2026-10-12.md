# Soglia — prova mobile separata, 12 ottobre 2026

Richiesta di William: riprendere il comportamento del menu mobile dalla registrazione Psyop `ScreenRecording_10-12-2026 17-06-26_1.mp4`. La barra nera contiene ISO a sinistra, il meter approvato al centro e tre barrette a destra. Le barrette diventano una X; un pannello bianco scende sotto la barra e le voci FILM, FRAGMENT, BLOG, ABOUT compaiono una dopo l'altra. In chiusura il pannello risale e rivela il contenuto sottostante. Tap rapidi invertono le transizioni correnti.

La frase della Soglia è disposta su cinque righe, con il font esistente e uno sfalsamento verso destra delle righe centrali. Al primo ingresso nella visita le lettere arrivano dai quattro lati e si fermano nelle posizioni del testo. Sotto la frase compare la cartolina, larga quanto il contenuto disponibile. La pagina può scorrere sui telefoni piccoli e considera i margini sicuri del dispositivo.

## Isolamento

La prova ha l'indirizzo dedicato `mobile.html`. Non ci sono reindirizzamenti dal sito normale né nuove regole nel CSS desktop. `dist/index.html`, `dist/soglia-frozen.html`, le risorse condivise e gli snapshot Frozen conservano i contenuti del commit Sites di partenza `d48f965f3873cb44ff26b9717d0a070ab62b864e`.

`mobile.html` conserva il codice del player e del meter del contenitore corrente. `soglia-mobile.js` applica il layout della cartolina soltanto al documento dell'iframe della prova. Usa lo stesso motore eraser, il medesimo guard rail e i medesimi loop Cloudflare River / Endless Ascent / EXT Sciola. L'iframe quadrato non cambia dimensione quando le barre del browser si aprono o chiudono durante lo scroll. Un cambio effettivo di larghezza/orientamento conserva il comportamento di ridimensionamento del motore originale.

La cartolina diventa interattiva quando immagini e audio sono preparati e l'arrivo delle lettere è terminato. Non vengono introdotti percentuali, spinner o altri pannelli di caricamento. Il contesto audio si sblocca nel gesto sull'eraser o sul meter. L'apertura del menu non riavvia né sospende i loop. Il clic su una destinazione sfuma l'audio in uscita. La cronologia ripristina il contenuto e l'audio senza ripetere l'introduzione.

## Navigazione della prova

FILM, BLOG e ABOUT puntano alle preview Sites attive recuperate il 12 ottobre. FRAGMENT punta alla preview Home 2 / Terra Viva già condivisa nel progetto il 7 ottobre. Il nuovo menu emette prima `iso:navigate-request`, cancellabile dall'assemblaggio futuro, con `target`, `href` e `source: soglia-mobile`. Questi collegamenti sono provvisori finché le pagine non vengono riunite sul dominio finale.

## Verifica

Controlli Node sul menu, focus, chiusura, tap ripetuti, gate fra media e animazione, ritorno dalla cronologia; prove del motore eraser con pointer touch e geometria mobile, tre e cinque layer; confronto del player con il contenitore desktop e confronto del contenuto dei file originali. Verifiche di sintassi HTML/JS e dei percorsi locali.

Browser QA non disponibile in questo ambiente: il controllo touch reale, l'ascolto su iPhone e il confronto visivo finale con la registrazione restano da verificare nella preview. La prova non è una nuova versione Frozen.
