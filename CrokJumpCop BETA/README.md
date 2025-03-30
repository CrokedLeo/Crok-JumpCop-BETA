# CorkJumpCop BETA

## Descrizione del Gioco

CorkJumpCop BETA è un videogioco 2D basato in pixel art, dove il giocatore deve evitare ostacoli rappresentati da poliziotti e veicoli, raccogliendo birre per aumentare il punteggio e il livello di alcol. Ogni livello ha una difficoltà crescente e il gioco è accompagnato da una colonna sonora. L'obiettivo principale è evitare gli ostacoli, raccogliere birre e arrivare il più lontano possibile!

## Contenuto

- **Giocatore**: Il protagonista salta per evitare ostacoli e raccoglie birre per aumentare il punteggio.
- **Ostacoli**: Comprendono poliziotti, auto della polizia e elicotteri. Ogni ostacolo ha una velocità e un comportamento diversi.
- **Birre**: Il giocatore deve raccogliere birre che appaiono tra gli ostacoli per aumentare il punteggio e il livello di alcol.
- **Livelli**: Ogni livello cambia lo sfondo del gioco e aumenta la difficoltà (velocità degli ostacoli e frequenza di spawn).
- **Audio**: Colonna sonora e suoni di gioco (salto, crash, raccolta birra).

## Installazione

Per far funzionare il gioco, è sufficiente copiare i file nelle rispettive cartelle:

- **HTML**: Il file `index.html` contiene la struttura del gioco.
- **CSS**: Il file `style.css` è responsabile per lo stile visivo del gioco.
- **JavaScript**: Il file `game.js` gestisce la logica del gioco, i movimenti, le collisioni e l'interazione con il giocatore.
- **Audio**: Le tracce audio (`Dragostea Din Tei.mp3`, `jump.mp3`, `crash.mp3`, `beer.mp3`, `slide.mp3`) devono essere presenti nella cartella `audio/`.
- **Immagini**: Le immagini per lo sfondo e gli oggetti (poliziotti, veicoli, birre) sono nella cartella `img/`.

### Esempio di struttura delle cartelle:

```plaintext
/project-folder
  /audio
    - Dragostea Din Tei.mp3
    - jump.mp3
    - crash.mp3
    - beer.mp3
    - slide.mp3
  /img
    - desert.png
    - countryside.png
    - city.png
    - 1.png
  /css
    - style.css
  /js
    - game.js
  - index.html
