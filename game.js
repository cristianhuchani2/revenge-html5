// ================== CANVAS ==================
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

// ================== FPS ==================
const FPS = 30;
const fpsInterval = 1000 / FPS;
let lastTime = 0;

// ================== ESTADOS ==================
const LOADING = 0, MENU = 1, GAME = 2, PAUSE = 3, OVER = 4;
let state = LOADING;

// ================== IMAGENES ==================
const dinoImg = new Image(); dinoImg.src = "dino.png";
const cactusImg = new Image(); cactusImg.src = "cactus.png";
const birdImg = new Image(); birdImg.src = "bird.png";
const bgImg = new Image(); bgImg.src = "background.png";

let loaded = 0;
[dinoImg, cactusImg, birdImg, bgImg].forEach(img => {
  img.onload = () => {
    loaded++;
    if (loaded === 4) state = MENU;
  };
});

// ================== CONFIG ==================
const groundY = 236;

// ================== DINO ==================
const dino = {
  x: canvas.width / 2 - 37,
  y: groundY,
  w: 74,
  h: 72,
  vx: 0,
  vy: 0,
  speed: 4,
  gravity: 0.7,
  jumpForce: -12,
  grounded: true,
  dir: 1,

  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    this.x += this.vx;

    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.grounded = true;
    }

    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
  },

  draw() {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.scale(this.dir === 1 ? -1 : 1, 1);
    ctx.drawImage(dinoImg, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  },

  jump() {
    if (this.grounded) {
      this.vy = this.jumpForce;
      this.grounded = false;
    }
  },

  reset() {
    this.x = canvas.width / 2 - this.w / 2;
    this.y = groundY;
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
    this.dir = 1;
  }
};

// ================== ENEMIGOS ==================
let enemies = [];
let gameTime = 0;
const spawnDelay = FPS * 3;

function spawnEnemy() {
  if (gameTime < FPS * 6) {
    enemies.push(createCactus());
  } else {
    enemies.push(Math.random() < 0.5 ? createCactus() : createBird());
  }
}

function createCactus() {
  const left = Math.random() < 0.5;
  return {
    type: "cactus",
    x: left ? -60 : canvas.width,
    y: groundY,
    w: 52,
    h: 100,
    vx: left ? 2 : -2
  };
}

function createBird() {
  const left = Math.random() < 0.5;
  return {
    type: "bird",
    x: left ? -60 : canvas.width,
    y: groundY - 60,
    w: 52,
    h: 52,
    vx: left ? 2 : -2,
    dir: left ? 1 : -1
  };
}

// ================== BALAS ==================
let bullets = [];

function shoot() {
  bullets.push({
    x: dino.x + dino.w / 2,
    y: dino.y + dino.h / 2,
    w: 6,
    h: 3,
    vx: 6 * dino.dir
  });
}

// ================== CONTROLES ==================
let leftHeld = false;
let rightHeld = false;

left.onclick = () => { leftHeld = true; dino.dir = -1; };
right.onclick = () => { rightHeld = true; dino.dir = 1; };
jump.onclick = () => dino.jump();
shootBtn.onclick = () => shoot();

document.addEventListener("mouseup", () => {
  leftHeld = false;
  rightHeld = false;
});

// ================== PAUSA ==================
pause.onclick = () => {
  if (state === GAME) state = PAUSE;
  else if (state === PAUSE) state = GAME;
};

// ================== COLISION ==================
function checkCollisions() {
  enemies.forEach(e => {
    if (
      dino.x < e.x + e.w &&
      dino.x + dino.w > e.x &&
      dino.y < e.y + e.h &&
      dino.y + dino.h > e.y
    ) {
      state = OVER;
    }
  });
}

// ================== LOOP ==================
function loop(time) {
  if (time - lastTime < fpsInterval) {
    requestAnimationFrame(loop);
    return;
  }
  lastTime = time;

  // ===== LOADING (FIX DEFINITIVO) =====
  if (state === LOADING) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CARGANDO...", canvas.width / 2, canvas.height / 2);

    requestAnimationFrame(loop);
    return;
  }

  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // ===== MENU =====
  if (state === MENU) {
    dino.draw();
    drawText("CLICK PARA JUGAR", canvas.height / 2);
  }

  // ===== GAME =====
  if (state === GAME) {
    gameTime++;

    dino.vx = 0;
    if (leftHeld) dino.vx = -dino.speed;
    if (rightHeld) dino.vx = dino.speed;

    dino.update();
    dino.draw();

    if (gameTime % spawnDelay === 0) spawnEnemy();

    enemies.forEach(e => {
      e.x += e.vx;
      drawEnemy(e);
    });

    enemies = enemies.filter(e => e.x > -100 && e.x < canvas.width + 100);

    bullets.forEach(b => {
      b.x += b.vx;
      ctx.fillStyle = "#fff";
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    checkCollisions();
  }

  // ===== PAUSA / GAME OVER =====
  if (state === PAUSE) drawText("PAUSA", 180, 24);
  if (state === OVER) drawText("GAME OVER", 180, 24);

  requestAnimationFrame(loop);
}

// ================== DIBUJO AUX ==================
function drawEnemy(e) {
  if (e.type === "cactus") {
    ctx.drawImage(cactusImg, e.x, e.y, e.w, e.h);
  } else {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    ctx.scale(e.dir === 1 ? -1 : 1, 1);
    ctx.drawImage(birdImg, -e.w / 2, -e.h / 2, e.w, e.h);
    ctx.restore();
  }
}

function drawText(text, y, size = 16) {
  ctx.fillStyle = "#fff";
  ctx.font = size + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, y);
}

// ================== INICIO ==================
canvas.onclick = () => {
  if (state === MENU) {
    enemies = [];
    bullets = [];
    gameTime = 0;
    dino.reset();
    state = GAME;
  }
};

requestAnimationFrame(loop);
