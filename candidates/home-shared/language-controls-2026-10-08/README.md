# Regole comuni Home — 8 ottobre 2026

Ogni nuova Home inizia con una pagina interamente bianca: sono visibili solo il pulsante audio, il selettore della lingua e il più. L’installazione e i suoi fondi rimangono nascosti finché il pulsante audio non è attivato.

Tutte le nuove Home usano `ISOHomeControls.create({ root, onReveal })`, `home-controls.css`, il contratto `shared/iso-language.js` e la risposta ufficiale `shared/iso-meter-response.js`. Il controller aggiunge automaticamente il meter e il pulsante mute se mancano nel markup: due colonne stereo, 16 segmenti per colonna, x=50%, y=3.26vh, le stesse dimensioni di Home 2. Il meter entra in fade dopo l’uscita del pulsante e resta fermo in quel punto per tutta l’esperienza. La Home 3 Artwork mantiene l’eccezione del meter nel footer precedentemente approvata.

Font New Heterodox Mono Book, peso 500; ENGLISH/ITALIANO centrati sopra il più alla stessa altezza del pulsante audio. Lingua persistente e trasmessa dal più mediante `?lang=it|en`.

La sorgente reale espone `window.ISOAudioMeter`: `levels` stereo già smussati, `activate()` facoltativo, `setMuted(boolean)` con fade mute di .5 secondi / unmute di 1 secondo. Il controller usa sempre la sorgente reale disponibile; senza una traccia rimane a zero. La Home Truck non ha ancora una traccia assegnata e mostra le barre a riposo, più leggibili sul fondo plastificato. Non viene aggiunta una colonna sonora estranea.

Home 1 Truck: dopo il fade di uscita del pulsante (.65s), entra prima solo la pagina plastificata con un fade di 6 secondi, insieme al meter. A pagina comparsa, la fotografia del truck si costruisce automaticamente una particella alla volta, usando la stessa funzione e la stessa durata (3.1s) dei clic successivi. La composizione a pixel del truck e il suo movimento rimangono quelli approvati. A ingresso completato, i clic successivi mostrano titolo → testo → prezzo → simboli laterali → finale rosa. Il truck compare una sola volta e non richiede un altro clic iniziale. Il mute non ferma e non fa avanzare la sequenza. Reduced motion: ingresso immediato.
