# Soglia — riscontro audio confermato, 3 ottobre 2026

William ha ascoltato le prove 1 e 2 e riferisce che entrambe funzionano bene. Sono entrambe alimentate da Cloudflare R2: una usa il player HTML precedente e l'altra il player PCM attuale. La prova con copie locali non è stata ascoltata.

Base scelta per proseguire: player PCM attuale con audio e immagini su Cloudflare, fade di un secondo e crossfade dei loop. Nessuna ulteriore modifica al motore viene introdotta dopo questo riscontro.

- Sorgente Sites ascoltato: `5130fb2cf509276837b70d7305bdc215a0c912b6`.
- Backup GitHub del codice ascoltato: `9a12e686f1662ef1df91faa1db43e2666dd6c4c5`.
- Pagina: https://iso-soglia-real-meter.area-di-lavo-9208.chatgpt.site/?audio_origine=cloudflare
- Riscontro: 3 ottobre 2026, ore 16:41 Europe/Rome.

Il blocco precedente non si è ripresentato nelle prove riferite; la sua causa esatta non è stata accertata. La Frozen 73 originale resta intatta nel ramo `frozen/soglia-v73`, commit `1fd73843345ae54ccc74e3ed259c0f626883ebf3`.
