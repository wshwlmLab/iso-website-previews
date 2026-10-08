# Terra Viva — prima prova audio, 8 ottobre 2026

Delta della Home 2 con controlli comuni del 7 ottobre, commit `267b7d22f2ede6104ccf9173f8a102e2d8caa56b`. Foto approvata, mappa di profondità, shader, ritmo visivo di 14 secondi, posizione e stile del meter, pulsante e più restano invariati. Le versioni frozen e le altre home non sono modificate.

Il clic su Attiva l’audio avvia insieme Natural Disaster e Endless Ascent. Il primo è un loop mono al centro; il secondo conserva lo stereo e procede alla velocità originale. Il controllo del meter silenzia la somma con il fade ufficiale v1.2, senza riavviare le sorgenti o il movimento.

La curva delle rocce viene dalla velocità delle deformazioni del terreno, campionata sullo stesso shader e sullo stesso ciclo di 14 secondi. Un buffer di controllo non udibile applica la curva in Web Audio, senza timer sul thread grafico. La fase visiva usa `AudioContext.currentTime`. Con movimento ridotto, la foto resta ferma e il livello delle rocce è costante.

`audio-config.js` contiene livelli indipendenti: `rockLevel: 1`, `musicLevel: 1`, escursione delle rocce fra 35% e 100%, uscita comune al 90% per lasciare margine. Il livello delle rocce può essere cambiato anche con `window.ISOAudioMeter.setRockLevel(valore)`, dove 1 corrisponde alla prova iniziale. Non c’è un nuovo comando visibile nella pagina.

I master WAV restano nell’archivio Drive di Terra Viva. Le derivate del sito sono MP3 a 48 kHz: Natural Disaster mono a 128 kbit/s, Endless Ascent stereo a 160 kbit/s. Il mono usa la media dei due canali originali, senza normalizzazione. La giunzione dei loop è sfumata per un secondo; il primo ascolto inizia dal campione iniziale, a velocità normale. Dopo la preparazione non vengono richiesti nuovi file per loop o mute.

| File | Byte | SHA-256 |
|---|---:|---|
| Natural Disaster master | 16.655.642 | `e42e7561777b172ed4c5b3495747700ec217ffb867bd9df93a903658ea11454c` |
| Endless Ascent master | 37.255.496 | `7116f256df11592274480a02b1484d3314d1e4fdb19cf3d8bebf9f46a01b902f` |
| Natural Disaster mono MP3 | 926.253 | `f7f241ff1fb8e56913201d8168e055e079deba6c976dc6b28c6d124ab0f2c433` |
| Endless Ascent stereo MP3 | 3.849.928 | `73288a000d18344e3e0673f27af06061d071081fef17ee2c71fa08f9896e21d5` |

Le derivate sono pubblicate nel contenitore R2 esistente in `cartoline/terra-viva/v1/audio/`, tramite il workflow manuale già esistente ISO — Cartoline R2 — upload e verifica, esecuzioni 1824 e 1825. Rilettura pubblica HTTP 200, CORS `*`, dimensioni e SHA-256 verificati. I byte vengono verificati nuovamente nel browser prima della decodifica.

La prova è fissata su Terra Viva. La selezione casuale delle altre home verrà collegata quando saranno disponibili i rispettivi blocchi audio.

## Verifica

Chromium 138, viste 1440×900 e 390×844: ingresso bianco, preparazione completa prima dell’attivazione, svelamento con fade, meter stereo alimentato dai due audio reali; mute e riattivazione senza nuove richieste o ripartenze. Foto e mappa di profondità verificate rispetto agli SHA-256 canonici; shader identico alla versione precedente.

Rendering Web Audio offline con i file R2 reali, fino a 199 secondi: differenza L/R delle sole rocce esattamente zero; differenza RMS L/R della musica 0,157. Picco dell’uscita combinata 0,669, senza clipping. Salto alla giunzione: rocce 0,00052; musica inferiore a 0,00014. Prova con segnale mono costante: curva del terreno ripetuta ogni 14 secondi senza differenze fra cicli o canali; errore massimo rispetto all’inviluppo previsto inferiore a 0,000000009. Non è una prova d’ascolto sugli altoparlanti di William.
