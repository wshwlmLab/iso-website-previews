# Soglia — prova mobile separata, 12 ottobre 2026

Richiesta di William: riprendere il comportamento del menu mobile dalla registrazione Psyop `ScreenRecording_10-12-2026 17-06-26_1.mp4`. La barra nera contiene I.S.O. a sinistra, il meter approvato al centro e tre barrette a destra. Le barrette diventano una X; un pannello bianco scende sotto la barra e le voci FILM, FRAGMENT, BLOG, ABOUT compaiono una dopo l'altra. In chiusura il pannello risale e rivela il contenuto sottostante. Tap rapidi invertono le transizioni correnti.

La frase della Soglia è disposta su cinque righe, con il font esistente e uno sfalsamento verso destra delle righe centrali. Le lettere appaiono ferme in fade casuale: 260 ms per lettera, ritardo casuale da 0 a 980 ms, curva approvata della Soglia `cubic-bezier(.2,.7,.2,1)`. Non ci sono arrivi da fuori o altri movimenti iniziali. Il fade compare su un nuovo documento; il ritorno dalla cache della cronologia conserva la frase. Sotto la frase compare la cartolina, larga quanto il contenuto disponibile; sotto la cartolina si legge `IL SUONO ORGANIZZATO`, nel New Heterodox Mono Book del sito, peso 400 e tracking .055em come la scritta nella cornice desktop. La pagina può scorrere sui telefoni piccoli e considera i margini sicuri del dispositivo.

Aggiornamento richiesto alle 17:58: I.S.O. conserva il font e scende di 6 px. Il meter passa da 16 a 20 tacche per canale; l'altezza aumenta da 32 a 40 px e il centro sale di 3 px, per allungare le barre verso l'alto mantenendo il bordo inferiore quasi nella posizione precedente. Il pulsante audio conserva il proprio spazio di tocco e gli stessi fade audio. La risposta sonora e il motore della cartolina restano quelli approvati.

Aggiornamento richiesto alle 18:44: il posizionamento precedente di I.S.O. è sostituito da un controllo di 48 × 48 px, identico a quello del menu. La scritta occupa un riquadro di 34 × 13.5 px, centrato come le tre lineette, con font da 12 px e spaziatura compatta. I margini laterali sono speculari e non rimane l'abbassamento di 6 px. La firma sotto la cartolina usa esplicitamente il font e le maiuscole della scritta del sito. Meter, fade, eraser e menu conservano il comportamento approvato.

## Isolamento

La prova ha l'indirizzo dedicato `mobile.html`. Non ci sono reindirizzamenti dal sito normale né nuove regole nel CSS desktop. `dist/index.html`, `dist/soglia-frozen.html`, le risorse condivise e gli snapshot Frozen conservano i contenuti del commit Sites di partenza `d48f965f3873cb44ff26b9717d0a070ab62b864e`.

`mobile.html` conserva il codice del player e la risposta del meter del contenitore corrente, con il solo aumento delle tacche grafiche da 16 a 20. `soglia-mobile.js` applica il layout della cartolina soltanto al documento dell'iframe della prova. Usa lo stesso motore eraser, il medesimo guard rail e i medesimi loop Cloudflare River / Endless Ascent / EXT Sciola. L'iframe quadrato non cambia dimensione quando le barre del browser si aprono o chiudono durante lo scroll. Un cambio effettivo di larghezza/orientamento conserva il comportamento di ridimensionamento del motore originale.

La cartolina diventa interattiva quando immagini e audio sono preparati e il breve fade delle lettere è terminato. Non vengono introdotti percentuali, spinner o altri pannelli di caricamento. Il contesto audio si sblocca nel gesto sull'eraser o sul meter. L'apertura del menu non riavvia né sospende i loop. Il clic su una destinazione sfuma l'audio in uscita. La cronologia ripristina il contenuto e l'audio senza ripetere l'introduzione.

## Navigazione della prova

FILM, BLOG e ABOUT puntano alle preview Sites attive recuperate il 12 ottobre. FRAGMENT punta alla preview Home 2 / Terra Viva già condivisa nel progetto il 7 ottobre. Il nuovo menu emette prima `iso:navigate-request`, cancellabile dall'assemblaggio futuro, con `target`, `href` e `source: soglia-mobile`. Questi collegamenti sono provvisori finché le pagine non vengono riunite sul dominio finale.

## Verifica

Controlli Node sul menu, focus, chiusura, tap ripetuti, gate fra media e animazione, ritorno dalla cronologia; prove del motore eraser con pointer touch e geometria mobile, tre e cinque layer; confronto del player con il contenitore desktop e confronto del contenuto dei file originali. Verifiche di sintassi HTML/JS e dei percorsi locali.

Browser QA non disponibile in questo ambiente: il controllo touch reale, l'ascolto su iPhone e il confronto visivo finale con la registrazione restano da verificare nella preview. La prova non è una nuova versione Frozen.
