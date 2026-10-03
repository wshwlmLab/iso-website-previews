# Meter comune v1.2 — 3 ottobre 2026

Spegnimento in 0,5 secondi; riattivazione in 1 secondo. Il mute modifica solo il volume. Le sorgenti restano in riproduzione e i clic durante un fade ripartono dal volume raggiunto.

Il componente ufficiale è `../shared/iso-meter-response.js`. Tutte le copie distribuite sulle pagine sono identiche. I meter silenziosi del Blog restano a zero. La Home TOTIP corrente è uno studio grafico senza audio.

`site-adapters/` conserva l'HTML aggiornato, gli adattatori e le verifiche interessate dalla modifica. I media, gli altri asset e il progetto completo sono conservati nei repository Git dei rispettivi Sites; questi adattatori non sono un pacchetto completo per ridistribuire ogni pagina. La Soglia completa è aggiornata anche in `../soglia-v73-audio-candidate/`. `source-provenance.json` identifica gli esatti commit e le pubblicazioni. I rami e i file Frozen restano checkpoint storici.

| Pagina | Commit pubblicato | Link |
|---|---|---|
| soglia | `0bb844d2e8b6908ec094792f3cd5572dcafc2366` | [soglia](https://iso-soglia-real-meter.area-di-lavo-9208.chatgpt.site) |
| works | `9dfc877dfb5ef37b3c067924d68849253650ef76` | [works](https://iso-works-motion-lab.area-di-lavo-9208.chatgpt.site) |
| works-youtube | `7abaa07386161be837f121454b8e580c9372d00a` | [works-youtube](https://iso-works-acab-youtube-candidate.area-di-lavo-9208.chatgpt.site) |
| blog | `e7f78bd6dabfecda0d7ef1487ab842bc573c0884` | [blog](https://iso-blog-two-stories-candidate.area-di-lavo-9208.chatgpt.site) |
| blog-archive | `b0a77d78158c25ba7bda4b0b261d288f9cd68e80` | [blog-archive](https://iso-blog-archive-candidate-01.area-di-lavo-9208.chatgpt.site) |

WORKS usa il gain Web Audio. La prova YouTube usa lo stesso inviluppo sul volume del player e invia il mute nativo solo al termine del fade. Le copie Blog verde B/C e la pagina di confronto verdi dentro Archivio importano lo stesso profilo v1.2.

Verifiche dalla radice del repository:

```sh
node shared/tests/iso-meter-response.cjs shared/iso-meter-response.js
node shared/tests/iso-meter-fades.cjs shared/iso-meter-response.js
node soglia-v73-audio-candidate/qa/verify-v73-audio.mjs soglia-v73-audio-candidate/dist
```

Le verifiche coprono le durate, i cambi di direzione, le richieste ripetute, i frame ritardati, la chiusura del player, i loop dell'eraser con 3 e 5 layer e il player YouTube. Sono verifiche con Node e API simulate.
