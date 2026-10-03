# Soglia v73 — prova audio eraser

Candidate basata sul commit Sites approvato `d0a0349082d954425ff6356b5306c164ad014135`.
Il punto definitivo precedente è su GitHub in `soglia-v73-frozen/`, ramo `frozen/soglia-v73`, commit `1fd73843345ae54ccc74e3ed259c0f626883ebf3`.

| Foto | Audio provvisorio |
| --- | --- |
| 1 | River — river.mp3 |
| 2 | Endless Ascent — endless-ascent.mp3 |
| 3 | EXT Sciola — sciola.mp3 |

I tre file iniziano al primo gesto dell'utente e continuano a ripetersi anche quando sono silenziosi. Ogni volume è la frazione esatta di superficie della relativa foto visibile nel viewport. Il conteggio esclude i pixel ancora sotto il velo bianco e segue le sostituzioni anche nei giri successivi del ciclo.

I gain seguono il conteggio con una breve rampa continua. Il meter stereo misura il mix realmente emesso; mute e unmute usano la rampa di un secondo e non arrestano i file.

Foto, CSS, cornice, animazione della scritta e geometria dell'eraser derivano dalla v73 approvata. Il motore mantiene le soglie 99,5% per il primo velo e 90% per ogni passaggio successivo, con guard rail di 60 px. Il caricamento usa soltanto il file locale della v73.

Gli MP3 sono copie delle prove già in `soglia-audio-candidate/audio/`, con gli stessi hash Git. Per i media finali su Cloudflare R2 basta sostituire le tre sorgenti audio nella pagina.

Verifica automatica: sintassi JavaScript; CSS, immagini e animazione intro identici; conteggi confrontati con tutti i pixel visibili su almeno tre giri con tre e cinque layer; gain indipendenti; avvio dei tre loop con lo stesso gesto; mute e unmute senza pausa o riavvio. Verifica del browser e ascolto manuale non eseguiti in questo ambiente.

Nel progetto Sites: `node qa/verify-v73-audio.mjs dist`.
Nella cartella GitHub della candidate: `node qa/verify-v73-audio.mjs .`.

Stato: PROVA, in attesa dell'approvazione di William.
