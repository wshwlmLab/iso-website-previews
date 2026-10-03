# Cartoline — materiali e parole

Per preparare una nuova cartolina, William può fornire il link a una cartella Drive oppure allegare i file nella chat. Una cartella Drive per cartolina mantiene insieme originali e indicazioni.

Esempio di consegna:

- `Cartolina 02/immagini/01.jpg`, `02.jpg`, `03.jpg` e, se servono, `04.jpg` e `05.jpg`.
- `Cartolina 02/audio/01.wav`, `02.wav`, `03.wav`, con la stessa numerazione delle fotografie. Gli originali possono essere WAV; per il sito si preparano le copie MP3.
- Un testo con titolo, quattro o cinque parole, ordine delle immagini e abbinamenti diversi dalla numerazione, se desiderati.

La cartella Drive è il luogo di consegna degli originali. La pagina legge immagini, audio e configurazione da Cloudflare R2. L'aggiornamento viene eseguito dall'agente usando le connessioni esistenti; William non deve compilare codice o inserire credenziali nella pagina.

Ogni cartolina usa `cartoline/<id>/v1/manifest.json`, `images/01.jpg` e `audio/<nome>.mp3` nel bucket `il-suono-organizzato-audio`. Per sostituire materiali già approvati si crea una nuova versione, ad esempio `v2`, conservando la precedente. L'URL del sito seleziona la cartolina con `?cartolina=<id>&versione=v1`.

Nel manifest, `borderLabel` contiene il titolo breve della cornice e `borderWords` le parole. La cornice si prepara con le risorse della cartolina, prima dello svelamento. Il percorso quadrato, il carattere e la velocità di rotazione rimangono quelli approvati; il numero di ripetizioni si adatta alla lunghezza del testo per mantenere la spaziatura.

La cartolina attuale mantiene l'identificatore `soglia-prova`, versione `v1`, ed è presentata come **Cartolina 1** con le parole **acqua · pietra · ripetizione · cielo**. I tre abbinamenti rimangono River, Endless Ascent ed EXT Sciola, con gli stessi file e hash. Il motore audio e i fade approvati non sono stati modificati.

La procedura [ISO — Cartolina 1 — titolo e parole](https://autonomous-business-lab.app.n8n.cloud/workflow/T4K2zER0L7tfXHUF) è nel progetto personale di William, alla radice. Si esegue solo manualmente, senza webhook o pianificazioni; scrive esclusivamente il manifest della cartolina attuale e ne verifica hash e CORS su Cloudflare.
