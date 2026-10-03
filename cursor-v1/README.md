# Cursore comune ISO v1 — 3 ottobre 2026

Cerchio pieno di 12 pixel con colori invertiti sulle superfici. Sui link e sui controlli compare la mano nativa. Il componente comune è `../shared/iso-cursor.js`; la guida è `../shared/OFFICIAL-CURSOR-v1-2026-10-03.md`.

Tutte le copie distribuite nelle nove pubblicazioni attuali sono identiche. La Soglia conserva l'indicatore specifico della gomma durante l'eraser. Il componente copre anche gli iframe delle pagine interne. Su touch il comportamento resta nativo.

`site-patches/` contiene solo le importazioni e le integrazioni interessate da questa modifica, rispetto ai commit di base indicati in `source-provenance.json`. Il file comune e la guida sono salvati separatamente. I progetti completi, gli altri script e i media sono conservati nei repository Git dei rispettivi Sites. La Soglia completa è aggiornata anche in `../soglia-v73-audio-candidate/`. I file e i rami Frozen restano checkpoint storici.

| Pagina | Commit pubblicato | Link |
|---|---|---|
| soglia | `da7a68b69130f9f2d40b54115a0c4239869f4cd8` | [soglia](https://iso-soglia-real-meter.area-di-lavo-9208.chatgpt.site) |
| works | `a2f438c1afe6910ac45a57c34becfcea9a1a5907` | [works](https://iso-works-motion-lab.area-di-lavo-9208.chatgpt.site) |
| works-youtube | `24f7757a5b1e6eee4889c8653b1ccedf043d0e1e` | [works-youtube](https://iso-works-acab-youtube-candidate.area-di-lavo-9208.chatgpt.site) |
| blog | `b71f9792cbc9eb4bb2e2d0268ca2aeb8829319ca` | [blog](https://iso-blog-two-stories-candidate.area-di-lavo-9208.chatgpt.site) |
| blog-archive | `cb58aca8792b974994745a8670cfe8106cdee8a3` | [blog-archive](https://iso-blog-archive-candidate-01.area-di-lavo-9208.chatgpt.site) |
| home-totip | `7cd7fefd09fb174654276f0d82a92086a4550a57` | [home-totip](https://totip-fiume-anteprima.area-di-lavo-9208.chatgpt.site) |
| sound-horeg | `5d7b6a55eb16589e995b158946513c7d1bc0e64e` | [sound-horeg](https://iso-sound-horeg-layout-01.area-di-lavo-9208.chatgpt.site) |
| gumleaf | `f5562904618e560e46db306fd37ecd17e48941fd` | [gumleaf](https://iso-gumleaf-layout-01.area-di-lavo-9208.chatgpt.site) |
| ick | `1687426a391b8797b42a23d9fe0d105bb75f71bb` | [ick](https://iso-ick-interview-layout-01.area-di-lavo-9208.chatgpt.site) |

Verifica: sintassi e importazioni su 23 pagine HTML; parità delle sorgenti salvo le importazioni; controllo della logica con un modello DOM/API; build della Home sulla sua ultima base. La verifica visiva in un browser reale non è stata eseguita. Non sono stati cambiati gli audio, il comportamento dei meter o il meccanismo dell'eraser.
