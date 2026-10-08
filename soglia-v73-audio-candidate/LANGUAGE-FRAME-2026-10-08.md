# Prova lingua nella cornice della Soglia

Richiesta di William dell'8 ottobre 2026, ore 20:00–20:01 Europe/Rome. Il selettore in alto a destra, allineato ad ATTIVA L'AUDIO/SOUND ON, riguarda la Home: verrà applicato nella chat della Home. In questa prova cambia soltanto il controllo ROME, ITALY nella cornice della Soglia.

Il controllo mostra sempre ROME, ITALY a riposo. In italiano, hover o focus da tastiera mostrano ENGLISH; in inglese mostrano ITALIANO. Il clic cambia la scelta di lingua senza ricaricare la pagina. La scritta della città conserva il proprio ingombro e l'etichetta della lingua è sovrapposta: ora, fuso orario e anno mantengono le loro posizioni.

Prova di movimento richiesta alle 20:20: ROME, ITALY scompare lettera per lettera nello stesso ordine casuale e con gli stessi tempi dell'uscita del menu Soglia (fade di ogni lettera 190 ms, intervalli di 72 ms con variazione di 0–40 ms). Dopo l'ultima lettera, ENGLISH/ITALIANO entra con un fade dell'intera parola di 420 ms. Uscendo dal controllo, la lingua sfuma in 240 ms e tornano le lettere della città. L'ingombro e l'area cliccabile rimangono costanti durante entrambe le fasi; le transizioni CSS si interrompono e si invertono direttamente sui valori correnti quando il mouse entra ed esce rapidamente. Con movimento ridotto, il cambio è immediato.

Il modulo riutilizzabile `shared/site-language.js` espone `window.ISOSiteLanguage.getLanguage()`, `setLanguage('it'|'en')`, `toggleLanguage()` e `subscribe(callback)`. La preferenza è salvata localmente come `iso.language`. Pagina e iframe condividono un'unica scelta; il documento aggiorna l'attributo `lang`. Il modulo emette `iso:language-change` con `detail.language` sul proprio window principale. I callback inizializzano subito il controllo e si scollegano quando una pagina viene scartata, conservando il collegamento durante la cache della cronologia.

Questa è una prova del selettore e dello stato lingua. Le frasi animate, le parole del menu e della cartolina, la grafica e gli altri contenuti conservano quelli approvati. Le traduzioni integrali verranno collegate separatamente. Nessuna nuova pagina iniziale, nessun nuovo audio o caricamento.

Per la Home, usare lo stesso modulo e la stessa scelta: ENGLISH/ITALIANO in alto a destra; ATTIVA L'AUDIO in italiano, SOUND ON in inglese. Non creare un'altra preferenza o un selettore fisso aggiuntivo nella cornice.
