# Il Suono Organizzato — continuità delle esperienze

Aggiornamento di William, 3 ottobre 2026: prima risolvere e misurare le performance; progettare poi dove e quando mostrare un'eventuale attesa. La schermata con percentuale della precedente prova Soglia è stata rifiutata e rimossa. Non introdurre automaticamente percentuali, spinner, blocchi a tutto schermo o pannelli di caricamento nelle altre pagine.

Le risorse necessarie allo svelamento manuale devono essere preparate prima di abilitarlo. Al primo ingresso in Soglia, l'ingresso tipografico approvato resta visibile e interattivo mentre immagini e audio vengono preparati in parallelo. La transizione verso la cartolina viene completata solo quando tutti i layer sono pronti. Dopo che inizia l'eraser, nessun caricamento deve interromperlo o sostituirlo con un indicatore.

Decisione di William dell'8 ottobre 2026: l'introduzione della Soglia compare soltanto al primo ingresso della visita. Quando si torna dalla navigazione interna, tramite cronologia o ricaricando la pagina nella stessa scheda, si raggiunge direttamente il menu con l'eraser. `shared/site-visit.js` conserva `iso.soglia.entered` in sessionStorage; le pagine assemblate devono condividere lo stesso dominio e la stessa chiave. Anche l'ingresso diretto attende la preparazione completa dei media prima di abilitare lo svelamento. La regola è già applicata alla Soglia; non introduce un cookie permanente o una schermata di caricamento.

Regole di implementazione:

- Dichiarare e scaricare tutti i layer della cartolina, anche quelli dei giri successivi. Verificare risposta HTTP, completezza e SHA-256 quando presente nel manifest.
- Separare la preparazione dei dati audio dall'apertura del dispositivo. Usare un decoder offline a 48 kHz; aprire e sbloccare il contesto di riproduzione nel primo gesto reale dell'utente, anche durante l'introduzione.
- Conservare in memoria i buffer audio, le immagini decodificate e i canvas. I loop partono insieme una volta sola, inizialmente a volume zero, e non vengono riavviati durante svelamento, cambio foto o mute.
- Riutilizzare le risorse già valide negli eventuali recuperi; non ricaricare la pagina visibile e non ripetere l'introduzione. Non ripiegare silenziosamente su vecchi audio o file incompleti.
- Evitare letture della geometria SVG/DOM dopo scritture a ogni campione del mouse. Misurare il costo del motore, confrontare il comportamento prima/dopo e preservare soglie, forme e guard rail approvati.
- Conservare diagnostica locale di risorse, preparazione, stato audio e operazioni lunghe, senza inviarla a servizi esterni. Un'eventuale attesa visibile è una scelta successiva da progettare con William, non la soluzione al carico del motore.

Il loader riutilizzabile è in [shared/experience-loader.js](shared/experience-loader.js). Non crea alcuna interfaccia di caricamento. La regola è applicata alla prova audio della Soglia basata sulla v73; le altre pagine la adotteranno nei successivi interventi. Le versioni FROZEN approvate restano intatte.

Prima di dichiarare risolta un'interruzione sonora, distinguere i test automatici dal riscontro nel browser reale. Il rapporto della prova attuale si trova in [soglia-v73-audio-candidate/PERFORMANCE.md](soglia-v73-audio-candidate/PERFORMANCE.md).
