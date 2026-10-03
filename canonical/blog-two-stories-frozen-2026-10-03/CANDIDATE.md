# BLOG — Due storie — Candidate 02

In attesa di approvazione. Font ufficiale New Heterodox Mono.

- Cornice e identità angolari: Soglia v73, commit d0a0349082d954425ff6356b5306c164ad014135. Cornice laterale 1vw come applicata dal contenitore ufficiale; 6.52vh sopra e sotto. Meter originale in stato senza segnale.
- Sfoglio: motore approvato BLOG del 18 settembre, commit e49d54e60ee4c2bc0c6d36e7f1b6504f18cfda06. DURATION 700, twoStageProgress e pageTurnFrames preservati esattamente. Due storie in loop, avanti/indietro, un gesto = una transizione.
- Sound Horeg: candidato 29, commit eab30d101daccf39a1e5013faa58957adf307a6f.
- Gumleaf: candidato 06, commit b04817e1b4c9d8a750481056af1baac6c057fce0.
- Impaginazioni e motore interno degli articoli preservati. Rimossa soltanto la vecchia cornice interna per usare la cornice condivisa; contatore limitato alle due storie presenti.
- Sorgenti approvati e baseline Drive MERSI v04.4 non modificati.
- Foto della signora: margine destro ricostruito e inquadratura spostata a sinistra mantenendo la figura a destra del centro.
- Cornice nera sottile sulle immagini piccole nell'apertura di entrambe le storie, coerente durante ricomposizione e hero.
- Banda verde di 7px tra fotografie storiche Gumleaf e concerto sul palco.

## Candidate 03 — Didascalie, 3 ottobre 2026

Rimosse le note di lavorazione visibili da entrambe le storie. Gumleaf: Riflessi / Sandy Creek, Bournda (fonte indice fotografico 21, NSW National Parks); Germogli; rimossa la didascalia del palco. Didascalie del sottobosco e delle bande conservate. Sound Horeg: Prima della festa; Maschere nella notte; Fra le case; Il corteo. Conservato aggiornamento meter v1.1 da commit 8d48b74785f4b4454ac48f51548fdfae2452178a.


## Candidate 04 — 2026-10-03

Card typography: title and all metadata increased by exactly 25%, including mobile and child opening proxies. Card geometry, navigation and opening/horizontal motion unchanged. Shared Soglia frame and meter helper preserved.

Sound Horeg captions now use geographic/festival references rather than generic descriptions:
- foto_40: Malang / Giava Orientale. Fully Syafi / PFI photo essay identifies the regional context, not a precise village. https://pewartafotoindonesia.or.id/2025/11/06/rana/hura-hore-horeg/
- recreated foto_44: Contesto: festa dell’indipendenza / Malang. AFP source photograph taken 9 August 2025 in Malang for Indonesia’s 80th Independence Day. https://www.arabnews.com/node/2612812
- generated village street: Luoghi del bersih desa: Urek-urek / Malang. Contextual example, not location attribution for this generated scene. Canonical Sound-Horeg-due-immagini-scelte.md explicitly states no photographed event/location can be claimed.
- recreated foto_28: Riferimento: Urek Urek Carnival / Urek-urek. Identifies the source reference, not the generated scene as documentary photography. https://www.antarafoto.com/id/view/2572877/karnaval-desa-diiringi-perangkat-audio-berkapasitas-besar-di-malang


## Candidate 05 — 2026-10-03

Only the four Sound Horeg captions have changed per William: Allestimento del sound system; Festa dell’indipendenza / Malang; Bersih desa / Urek-urek, Malang; Urek Urek Carnival. Remove visible Context/Reference/Places prefixes; the source and generated-image provenance documented above remains unchanged. Card +25% typography, imagery, layouts, navigation and motion preserved.


## Candidate 06 — 2026-10-03

Sound Horeg setup caption simplified to Ngantru per request for a village name. This is a contextual reference to a documented place where these celebrations occur, not verified photograph-location attribution for foto_40. AFP describes festivities and residents in Ngantru: https://www.arabnews.com/node/2612812

Desktop final panel/photo width increased by 8% (ratio 1.5286 to 1.650888) and constrained to at least 100% of the article viewport. Former height-only width calculation left the preceding white Limite page visible at maximum scroll on wide screens. Existing black 32% text / 68% photo arrangement retained, final right border removed. Mobile final spread unchanged. Scripts and navigation/opening/scroll unchanged. Geometry verified for common desktop and ultrawide viewport sizes.


## Candidate 07 — 2026-10-03

Final Sound Horeg title constrained to the existing three lines: Dove / “abbastanza” / non basta più. Desktop red line shifted right .45em so the grave accent falls beyond the preceding white line, rather than into its closing quote. Official font, sizes, tracking and tight .86 desktop leading unchanged. No added vertical spacing. Final enlarged image and viewport width fix preserved. Mobile gets stable line breaks without horizontal offset. Scripts unchanged. Glyph advance check using the actual Book/Bold OTF: at 60px, accented U starts 23px beyond the upper line end.


## Candidate 08 — 2026-10-03

Opening geography and story metadata +25% in both articles (entry transition and hero; desktop clamp endpoints/vw values and mobile fixed values). Existing larger index card unchanged. Headlines unchanged. Scripts and canonical article paragraphs unchanged.

Gumleaf: remove Dentro il verde; Sandy Creek / Bournda; Bedfordia arborescens replaces Il sottobosco (photo 161, Blanket Leaf source verified in canonical catalog and Cardinia botanical guide); remove archivio suffix, leave Purfleet Gumleaf Band; Eucalipto replaces Germogli for photo 163 (genus-level visual identification only, no species claimed). Sources: https://www.cardinia.vic.gov.au/services/environment-and-trees/plant-guide/blanket-leaf ; original 163 catalog link https://extinctionmatters.au/program/ does not identify species, so no species-level caption.

Sound Horeg: Ngantru / Giava Orientale (province confirmed by AFP); Bersih desa / Malang removes repeated Urek-urek reference; Urek Urek Carnival on next image retained. Ngantru remains a contextual village reference as previously documented, not proof of foto_40 location.

Next design step requested by William: plan article exit and a BLOG archive with all story numbers arranged one below another, possibly photo + number + title. No archive or new navigation implemented yet.
