# Il Suono Organizzato — lingua nelle cornici, v1 approvata

Approvata da William l'8 ottobre 2026, ore 20:31 Europe/Rome: usare questo comportamento come regola comune in tutte le pagine dotate di cornice. Riferimento visivo: prova Soglia salvata nel commit `51eac1a1e021387e0faf50f6cfb65b4761c26dbb`.

## Comportamento

- A riposo si legge ROME, ITALY, nel font e nella posizione già approvati per la cornice. Non aggiungere un selettore lingua fisso.
- Su hover o focus da tastiera, ROME, ITALY scompare lettera per lettera, nello stesso ordine casuale dell'uscita delle parole della Soglia: 190 ms per lettera, intervalli di 72 ms con variazione di 0–40 ms.
- Dopo l'ultima lettera, la parola ENGLISH entra tutta insieme con un fade di 420 ms se la lingua attuale è italiana. Se è inglese, compare ITALIANO con lo stesso fade.
- Il clic cambia la lingua condivisa del sito. Spostando il mouse, la parola della lingua sfuma in 240 ms e tornano le lettere di ROME, ITALY, con intervalli di 38 ms e variazione di 0–18 ms.
- Ora, fuso orario e anno continuano il loro normale funzionamento e mantengono la posizione. Il testo della città conserva sempre il proprio ingombro; ENGLISH/ITALIANO è sovrapposto e centrato orizzontalmente nello spazio di ROME, ITALY, come richiesto alle 21:03. L'area cliccabile non cambia durante l'animazione.
- Freccia normale nel sito e puntatore a dito sul controllo. I cambi rapidi di hover invertono le transizioni correnti; con movimento ridotto il cambio è immediato.

## Codice comune

Usare [site-language.js](site-language.js) per l'unica preferenza `iso.language`, condivisa tra pagina e iframe. Usare [frame-language-v1.css](frame-language-v1.css) e [frame-language-v1.js](frame-language-v1.js) per il controllo. Il controller supporta i controlli `.location-language` e ignora inizializzazioni ripetute sullo stesso elemento. Non creare altre chiavi di lingua o cambiare i tempi pagina per pagina.

```html
<link rel="stylesheet" href="shared/frame-language-v1.css">
<script defer src="shared/site-language.js"></script>
<script defer src="shared/frame-language-v1.js"></script>

<button class="location-language" type="button" aria-label="Passa alla versione inglese">
  <span class="location-name" aria-hidden="true">ROME, ITALY</span>
  <span class="language-target" aria-hidden="true">ENGLISH</span>
</button>
```

Inserire il pulsante nel punto già occupato dalla città, lasciando ora e anno come elementi fratelli. Adattare soltanto i percorsi degli asset al progetto. Quando si importa il controller condiviso, rimuovere l'eventuale binding locale duplicato: un clic deve cambiare lingua una volta sola.

## Applicazione

La Soglia usa già il comportamento approvato. I componenti comuni sono salvati per l'adozione nelle altre cornici e nell'assemblaggio del sito; questo salvataggio non dichiara aggiornate le altre preview. I contenuti tradotti si collegano alla stessa scelta di lingua quando vengono integrati.

La pagina bianca iniziale della Home mantiene il proprio selettore ENGLISH/ITALIANO e ATTIVA L'AUDIO/SOUND ON: è una modalità distinta, collegata alla stessa preferenza. Questa regola non aggiunge una cornice alle pagine che non la prevedono. Conservare gli snapshot Frozen approvati.
