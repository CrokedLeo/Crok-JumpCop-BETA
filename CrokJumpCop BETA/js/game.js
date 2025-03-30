// =======================
// CONFIGURAZIONE DI BASE
// =======================
const CONFIG = {
  GRAVITY: 0.6,
  JUMP_STRENGTH: -10,
  PLAYER_RADIUS: 20,
  PLAYER_HORIZONTAL_SPEED: 5, // Velocità di movimento orizzontale
  OBSTACLE_WIDTH: 50,
  OBSTACLE_HEIGHT: 50,
  BEER_RADIUS: 10,
  BASE_OBSTACLE_SPAWN_TIME: 200,
  MIN_OBSTACLE_SPAWN_TIME: 50,
  LEVEL_THRESHOLDS: [3333, 6666]
};

// Background di gioco per ogni livello
const BACKGROUNDS = {
  1: "img/desert.png",
  2: "img/countyside.png",
  3: "img/city.png"
};

// Pattern di spawn per gli ostacoli
const SPAWN_PATTERNS = {
  1: ["officer", "officer", "policeCar"],
  2: ["officer", "policeCar", "officer", "policeCar"],
  3: ["officer", "policeCar", "helicopter", "policeCar", "officer"]
};
// =======================
// GESTIONE LEGENDA
// =======================

// Seleziona elementi
const legendButton = document.getElementById("legendButton");
const modal = document.getElementById("legendModal");
const closeButton = document.querySelector(".close");

// Quando clicchi il bottone "Legenda", apri la modale
legendButton.addEventListener("click", function () {
  modal.style.display = "flex";
});

// Quando clicchi la "X", chiudi la modale
closeButton.addEventListener("click", function () {
  modal.style.display = "none";
});

// Chiudi la modale se clicchi fuori
window.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// =======================
// GESTIONE AUDIO
// =======================

// Elemento audio per la colonna sonora
const bgMusic = document.getElementById("background-music");
bgMusic.volume = 0.5;

// Oggetti per gli effetti sonori, incluso il suono per lo slide
const SOUNDS = {
  jump: new Audio("audio/jump.mp3"),
  crash: new Audio("audio/crash.mp3"),
  beer: new Audio("audio/beer.mp3"),
  slide: new Audio("audio/slide.mp3")
};

// Bottone per il controllo dell'audio
const toggleMusicBtn = document.getElementById("toggleMusic");
toggleMusicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusicBtn.textContent = "🔊";
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = "🔇";
  }
});

// Per abilitare l'audio al primo clic su Start (alcuni browser bloccano l'autoplay)
document.getElementById("startButton").addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusicBtn.textContent = "🔊";
  }
});

// =======================
// GESTIONE DEL GIOCO
// =======================

// Classe Giocatore
class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 50;
    this.y = canvas.height - 55;
    this.radius = CONFIG.PLAYER_RADIUS;
    this.dy = 0;
    this.onGround = false;
    this.isSliding = false;
    this.coyoteTimer = 10;
    this.maxCoyoteTime = 10;
    this.jumpKeyHeld = false; // Per il salto variabile

    // Variabili per il movimento orizzontale
    this.moveLeft = false;
    this.moveRight = false;
  }
  update() {
    // Movimento orizzontale
    if (this.moveLeft) {
      this.x -= CONFIG.PLAYER_HORIZONTAL_SPEED;
    }
    if (this.moveRight) {
      this.x += CONFIG.PLAYER_HORIZONTAL_SPEED;
    }
    // Limita il movimento per non uscire dal canvas
    this.x = Math.max(this.radius, Math.min(this.x, this.canvas.width - this.radius));

    // Gestione del salto e della gravità
    if (this.jumpKeyHeld && this.dy < 0) {
      this.dy += CONFIG.GRAVITY * 0.2;
    } else {
      this.dy += CONFIG.GRAVITY;
    }
    this.y += this.dy;
    if (this.y + this.radius >= this.canvas.height) {
      this.y = this.canvas.height - this.radius;
      this.dy = 0;
      this.onGround = true;
      this.coyoteTimer = this.maxCoyoteTime;
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer--;
      this.onGround = false;
    }
  }
  jump() {
    if (this.onGround || this.coyoteTimer > 0) {
      // Riproduce l'effetto sonoro del salto
      SOUNDS.jump.currentTime = 0;
      SOUNDS.jump.play();
      this.dy = CONFIG.JUMP_STRENGTH;
      this.onGround = false;
      this.coyoteTimer = 0;
    }
  }
  slideStart() {
    if (!this.isSliding) {
      this.isSliding = true;
      // Riproduci il suono dello slide
      SOUNDS.slide.currentTime = 0;
      SOUNDS.slide.play();
      this.originalRadius = this.radius;
      this.radius = CONFIG.PLAYER_RADIUS / 2;
    }
  }
  slideEnd() {
    if (this.isSliding) {
      this.isSliding = false;
      this.radius = this.originalRadius || CONFIG.PLAYER_RADIUS;
    }
  }
  draw(ctx) {
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.isSliding ? "😎" : "🥴", this.x, this.y);
  }
}

// Classe Ostacolo
class Obstacle {
  constructor(canvas, type = "officer") {
    this.canvas = canvas;
    this.type = type;
    if (this.type === "wall") {
      this.width = this.canvas.width / 3;
      this.height = this.canvas.height;
      this.x = this.canvas.width;
      this.y = 0;
    } else if (this.type === "helicopter") {
      this.width = CONFIG.OBSTACLE_WIDTH;
      this.height = CONFIG.OBSTACLE_HEIGHT;
      this.x = this.canvas.width;
      this.y = Math.random() * (this.canvas.height / 2 - 50) + 50;
    } else if (this.type === "policeCar") {
      this.width = CONFIG.OBSTACLE_WIDTH;
      this.height = CONFIG.OBSTACLE_HEIGHT;
      this.x = this.canvas.width;
      this.y = this.canvas.height - this.height;
    } else if (this.type === "officer") {
      this.width = CONFIG.OBSTACLE_WIDTH * 0.7;
      this.height = CONFIG.OBSTACLE_HEIGHT * 0.7;
      this.x = this.canvas.width;
      this.y = this.canvas.height - this.height;
    }
  }
  update(baseSpeed) {
    let speedMultiplier = 1;
    if (this.type === "officer") {
      speedMultiplier = 0.5;
    } else if (this.type === "helicopter") {
      speedMultiplier = 1.5;
    }
    this.x -= baseSpeed * speedMultiplier;
  }
  draw(ctx) {
    if (this.type === "wall") {
      ctx.fillStyle = "gray";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      let fontSize = this.type === "officer" ? "40px" : "50px";
      ctx.font = `${fontSize} Arial`;
      ctx.textAlign = "center";
      let emoji;
      if (this.type === "officer") emoji = "👮‍♂️";
      else if (this.type === "policeCar") emoji = "🚓";
      else if (this.type === "helicopter") emoji = "🚁";
      ctx.fillText(emoji, this.x + this.width / 2, this.y + this.height / 2 + 10);
    }
  }
}

// Classe Birra
class Beer {
  constructor(canvas) {
    this.canvas = canvas;
    this.radius = CONFIG.BEER_RADIUS;
    this.x = canvas.width;
    // Imposta una posizione verticale iniziale, ad esempio metà altezza del canvas
    this.initialY = canvas.height / 2;
    this.y = this.initialY;
    // Parametri per l'oscillazione verticale
    this.amplitude = 50;   // L'ampiezza dell'oscillazione (in pixel)
    this.frequency = 0.05; // Frequenza dell'oscillazione
    this.phase = Math.random() * 2 * Math.PI; // Fase iniziale casuale per variare il movimento tra le birre
  }
  update(speed) {
    // Movimento orizzontale
    this.x -= speed;
    // Aggiorna la fase per l'oscillazione
    this.phase += this.frequency;
    // Calcola la nuova posizione y basata sul moto sinusoidale
    this.y = this.initialY + this.amplitude * Math.sin(this.phase);
  }
  draw(ctx) {
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🍺", this.x, this.y);
  }
}


// Gestore dello stato di gioco
class GameState {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.player = new Player(canvas);
    this.obstacles = [];
    this.beers = [];
    this.score = 0;
    this.alcoholLevel = 0;
    this.level = 1;
    this.gameOver = false;
    this.win = false;
    this.endWallSpawned = false;
    this.obstacleSpawnTimer = 0;
    this.patternIndex = 0;
    this.updateBackground();
  }
  update() {
    this.player.update();
    this.updateObstacles();
    this.beers.forEach(beer => beer.update(this.speed));
    this.beers = this.beers.filter(beer => beer.x + beer.radius > 0);
    this.checkCollisions();
    this.updateLevel();
    this.score++;
  }
  updateObstacles() {
    this.obstacles.forEach(obstacle => obstacle.update(this.speed));
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    if (this.endWallSpawned) return;
    this.obstacleSpawnTimer += this.speed;
    let spawnInterval = Math.max(CONFIG.BASE_OBSTACLE_SPAWN_TIME - this.score / 200, CONFIG.MIN_OBSTACLE_SPAWN_TIME);
    let minSpacing = 250;
    if (this.obstacles.length > 0) {
      const lastObstacle = this.obstacles[this.obstacles.length - 1];
      if (lastObstacle.type === "helicopter") {
        minSpacing = 150;
      }
    }
    if (
      this.obstacleSpawnTimer > spawnInterval &&
      (!this.obstacles.length || this.obstacles[this.obstacles.length - 1].x < this.canvas.width - minSpacing)
    ) {
      let currentPattern = SPAWN_PATTERNS[this.level];
      let obstacleType = currentPattern[this.patternIndex % currentPattern.length];
      this.patternIndex++;
      const obstacle = new Obstacle(this.canvas, obstacleType);
      this.obstacles.push(obstacle);
      // Se l'ostacolo non è un muro, crea anche una birra
      if (obstacleType !== "wall") {
        const beer = new Beer(this.canvas);
        beer.x = obstacle.x + obstacle.width + 40;
        beer.y = this.canvas.height / 2 + 50 * Math.sin(beer.x / 100);
        this.beers.push(beer);
      }
      this.obstacleSpawnTimer = 0;
    }
  }
  checkCollisions() {
    // Verifica collisioni con ostacoli
    this.obstacles.forEach(obstacle => {
      const dx = Math.abs(this.player.x - (obstacle.x + obstacle.width / 2));
      const dy = Math.abs(this.player.y - (obstacle.y + obstacle.height / 2));
      if (dx < obstacle.width / 2 + this.player.radius && dy < obstacle.height / 2 + this.player.radius) {
        // Se il giocatore non sta facendo lo slide mentre l'ostacolo è un officer
        if (!(this.player.isSliding && obstacle.type === "officer")) {
          this.crash();
        }
      }
    });
    // Gestione raccolta birra
    this.beers = this.beers.filter(beer => {
      const dx = this.player.x - beer.x;
      const dy = this.player.y - beer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.player.radius + beer.radius) {
        // Riproduce il suono della birra raccolta
        SOUNDS.beer.currentTime = 0;
        SOUNDS.beer.play();
        this.score += 50;
        this.alcoholLevel += 1;
        return false;
      }
      return true;
    });
  }
  crash() {
    // Arresta il gioco e mostra "Game Over"
    this.gameOver = true;
    this.win = false;
    // Riproduce il suono di crash
    SOUNDS.crash.currentTime = 0;
    SOUNDS.crash.play();
    this.ctx.fillStyle = "red";
    this.ctx.font = "40px Arial";
    this.ctx.textAlign = "center";
  }
  updateLevel() {
    let prevLevel = this.level;
    if (this.score < CONFIG.LEVEL_THRESHOLDS[0]) {
      this.level = 1;
      this.speed = 1.5;
    } else if (this.score < CONFIG.LEVEL_THRESHOLDS[1]) {
      this.level = 2;
      this.speed = 2.5;
    } else {
      this.level = 3;
      this.speed = 3.5;
    }
    if (prevLevel !== this.level) {
      this.updateBackground();
      this.patternIndex = 0;
    }
    if (this.score >= 30000 && !this.endWallSpawned) {
      this.obstacles.push(new Obstacle(this.canvas, "wall"));
      this.endWallSpawned = true;
    }
  }
  updateBackground() {
    // Imposta il background del canvas in base al livello
    this.canvas.style.background = `url('${BACKGROUNDS[this.level]}') no-repeat center center fixed`;
    this.canvas.style.backgroundSize = 'cover';
  }
  draw() {
    this.player.draw(this.ctx);
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    this.beers.forEach(beer => beer.draw(this.ctx));
  }
}

// Game Loop
class GameLoop {
  constructor(gameState, scoreDisplay) {
    this.gameState = gameState;
    this.scoreDisplay = scoreDisplay;
    this.animationFrameId = null;
  }
  start() {
    if (!this.animationFrameId) {
      this.gameState.gameOver = false;
      this.gameState.win = false;
      this.gameState.score = 0;
      this.gameState.alcoholLevel = 0;
      this.gameState.obstacles = [];
      this.gameState.beers = [];
      this.gameState.level = 1;
      this.gameState.speed = 1.5;
      this.gameState.endWallSpawned = false;
      this.gameState.obstacleSpawnTimer = 0;
      this.gameState.player.y = this.gameState.canvas.height - 60;
      this.gameState.player.dy = 0;
      this.gameState.updateBackground();
      this.loop();
    }
  }
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  loop() {
    if (this.gameState.gameOver) {
      this.showGameOver();
      return;
    }
    this.gameState.ctx.clearRect(0, 0, this.gameState.canvas.width, this.gameState.canvas.height);
    this.gameState.update();
    this.gameState.draw();
    this.updateScoreDisplay();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }
  showGameOver() {
    this.gameState.ctx.fillStyle = "black";
    this.gameState.ctx.font = "30px Arial";
    this.gameState.ctx.textAlign = "center";
    if (this.gameState.win) {
      this.gameState.ctx.fillText("You Win!", this.gameState.canvas.width / 2, this.gameState.canvas.height / 2);
    } else {
      this.gameState.ctx.fillText("Game Over!", this.gameState.canvas.width / 2, this.gameState.canvas.height / 2);
    }
    this.gameState.ctx.fillText(`Final Score: ${this.gameState.score}`, this.gameState.canvas.width / 2, this.gameState.canvas.height / 2 + 40);
  }
  updateScoreDisplay() {
    this.scoreDisplay.textContent = `Score: ${this.gameState.score} | Level: ${this.gameState.level} | Tasso alcolemico: ${this.gameState.alcoholLevel}`;
  }
}

// Dimensioni massime del canvas (background di gioco)
const MAX_CANVAS_WIDTH = 800;
const MAX_CANVAS_HEIGHT = 600;

// Inizializzazione del gioco
function init() {
  const canvas = document.getElementById("gameCanvas");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");

  // Funzione di resize: il canvas rispetta le dimensioni massime
  const resizeCanvas = () => {
    canvas.width = Math.min(window.innerWidth - 50, MAX_CANVAS_WIDTH);
    canvas.height = Math.min(window.innerHeight - 150, MAX_CANVAS_HEIGHT);
  };

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const gameState = new GameState(canvas);
  const gameLoop = new GameLoop(gameState, scoreDisplay);

  // Eventi per il controllo del giocatore
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (!gameState.player.jumpKeyHeld) {
        gameState.player.jump();
      }
      gameState.player.jumpKeyHeld = true;
    }
    if (e.code === "ArrowDown") {
      gameState.player.slideStart();
    }
    if (e.code === "ArrowLeft") {
      gameState.player.moveLeft = true;
    }
    if (e.code === "ArrowRight") {
      gameState.player.moveRight = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      gameState.player.jumpKeyHeld = false;
    }
    if (e.code === "ArrowDown") {
      gameState.player.slideEnd();
    }
    if (e.code === "ArrowLeft") {
      gameState.player.moveLeft = false;
    }
    if (e.code === "ArrowRight") {
      gameState.player.moveRight = false;
    }
  });

  startButton.addEventListener("click", () => gameLoop.start());
  stopButton.addEventListener("click", () => gameLoop.stop());
}
init();
