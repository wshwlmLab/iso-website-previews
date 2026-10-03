# Meter comune v1.2 — 3 ottobre 2026

William ha chiesto di dimezzare il fade di spegnimento della Soglia e adottare lo stesso comportamento per tutti i meter audio del sito.

Il componente comune `shared/iso-meter-response.js` definisce ora sia la risposta delle barre sia l'inviluppo del mute:

- Spegnimento: rampa lineare di **0,5 secondi**.
- Riattivazione: rampa lineare di **1 secondo**.
- Un clic durante una rampa riparte dal volume raggiunto. Ripetere lo stesso stato non prolunga il fade.
- Mute e riattivazione agiscono sul volume; non fermano le sorgenti e non cambiano la posizione di riproduzione.
- Il movimento delle barre resta quello della v1.1, con reattività aumentata del 20% rispetto alla v1. Silenzio e assenza di una sorgente non generano movimento.

Il profilo è distribuito identico sulla Soglia corrente, WORKS, la prova WORKS con YouTube, BLOG Due storie e Archivio BLOG. Le ultime due pagine sono attualmente prive di audio e mantengono il meter a zero. La vecchia pagina BLOG v04.4 e le prove degli articoli non hanno un meter audio. La Home TOTIP corrente è uno studio grafico esplicitamente senza audio; i suoi cerchi animati non sono un controllo di mute.

I file e i rami Frozen restano checkpoint storici. Le pubblicazioni correnti ricevono una nuova versione. Il profilo v1.2 è quello da importare per nuove pagine e per collegare audio al Blog.

Per i gain Web Audio, chiamare `ISOMeterResponse.fadeMuted(context, gain.gain, muted)`. Per player in iframe, `createVolumeFader(writeVolume)` produce lo stesso inviluppo normalizzato senza interrompere la riproduzione. WORKS YouTube applica il fattore al volume scelto dall'utente; il comando nativo `mute()` arriva soltanto quando la rampa raggiunge zero. Un player chiuso annulla le successive scritture del volume. Il mute nativo di un trailer non deve precedere il fade del suo gain.

Gli adattatori audio espongono `ISOAudioMeter.setMuted(boolean)` e lo stato `paused`. Le sorgenti, la calibrazione e gli elementi delle singole pagine restano indipendenti dal profilo. I fade delle fotografie e il crossfade delle giunzioni dei loop della cartolina restano di un secondo.

Verifiche: profilo visivo a 60/120 Hz; mute a metà secondo, riattivazione a un secondo, inversioni e stato ripetuto; equivalente inviluppo dell'iframe, frame ritardati e chiusura; Soglia con 3/5 layer e un solo avvio dei loop; player YouTube con 20 misurazioni e riproduzione/mute/seek/chiusura. Le verifiche sono eseguite con Node e API simulate; non sono un ascolto del dispositivo di William.
