var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var raf = window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          function(fn){ setTimeout(fn,1000/30); };

// ================= IMÁGENES =================
var dinoImg = new Image(); dinoImg.src = "dino.png";
var birdImg = new Image(); birdImg.src = "bird.png";
var cactusImg = new Image(); cactusImg.src = "cactus.png";
var bgImg = new Image(); bgImg.src = "background.png";

// ================= ESTADOS =================
var LOADING=0, MENU=1, GAME=2, OVER=3;
var state = LOADING;

// ================= CARGA =================
var imagesLoaded = 0;
var totalImages = 4;

[dinoImg, birdImg, cactusImg, bgImg].forEach(img=>{
  img.onload = ()=>{
    imagesLoaded++;
    if(imagesLoaded === totalImages){
      state = MENU;
      resetGame();
    }
  };
});

// ================= CONFIG =================
var frames = 0;
var score = 0;
var difficulty = 1;

// 🔽 SUELO REAL (más abajo)
var dinoGroundY = 236; // ← CAMBIO PRINCIPAL

// ================= DINO =================
var dino = {
  w:74, h:72,
  x: canvas.width/2 - 37,
  y: dinoGroundY,
  vx:0, vy:0,
  speed:4,
  g:0.7,
  jump:-12,
  grounded:true,
  dir:1,

  update(){
    this.vy += this.g;
    this.y += this.vy;
    this.x += this.vx;

    if(this.y >= dinoGroundY){
      this.y = dinoGroundY;
      this.vy = 0;
      this.grounded = true;
    }

    if(this.x < 0) this.x = 0;
    if(this.x + this.w > canvas.width)
      this.x = canvas.width - this.w;
  },

  draw(){
    ctx.save();
    ctx.translate(this.x + this.w/2, this.y + this.h/2);
    ctx.scale(this.dir === 1 ? -1 : 1, 1);
    ctx.drawImage(dinoImg, -this.w/2, -this.h/2, this.w, this.h);
    ctx.restore();
  },

  jumpUp(){
    if(this.grounded){
      this.vy = this.jump;
      this.grounded = false;
    }
  },

  reset(){
    this.x = canvas.width/2 - this.w/2;
    this.y = dinoGroundY;
    this.vx = this.vy = 0;
    this.grounded = true;
    this.dir = 1;
  }
};

// ================= ENEMIGOS =================
var enemies = [];
var spawnTimer = 0;
var spawnInterval = 120;
var spawnCount = 0;

function createCactus(){
  var fromLeft = Math.random() < 0.5;
  return {
    type:"cactus",
    x: fromLeft ? -52 : canvas.width,
    y: dinoGroundY + 10, // cactus a la misma base visual
    w:52, h:100,
    vx: fromLeft ? 2 + difficulty : -2 - difficulty
  };
}

function createBird(){
  var fromLeft = Math.random() < 0.5;
  var scale = 0.7;
  return {
    type:"bird",
    x: fromLeft ? -60 : canvas.width,
    y: dinoGroundY - 40, // pájaro más abajo también
    w:75*scale, h:75*scale,
    vx: fromLeft ? 2 + difficulty : -2 - difficulty,
    dir: fromLeft ? 1 : -1
  };
}

// ================= BALAS =================
var bullets = [];

function shoot(){
  bullets.push({
    x: dino.x + dino.w/2,
    y: dino.y + dino.h/2,
    w:6, h:3,
    vx: 6 * dino.dir
  });
}

// ================= CONTROLES =================
var moveLeft=false, moveRight=false;

left.onmousedown = left.ontouchstart = ()=>{ moveLeft=true; dino.dir=-1; };
left.onmouseup   = left.ontouchend   = ()=> moveLeft=false;

right.onmousedown = right.ontouchstart = ()=>{ moveRight=true; dino.dir=1; };
right.onmouseup   = right.ontouchend   = ()=> moveRight=false;

jump.onclick = jump.ontouchstart = ()=>{ if(state===GAME) dino.jumpUp(); };
shootBtn.onclick = shootBtn.ontouchstart = ()=>{ if(state===GAME) shoot(); };

canvas.onclick = ()=>{
  if(state===MENU) state=GAME;
  else if(state===OVER) resetGame();
};

// ================= RESET =================
function resetGame(){
  enemies = [];
  bullets = [];
  frames = score = 0;
  spawnTimer = spawnCount = 0;
  difficulty = 1;
  dino.reset();
}

// ================= COLISIONES =================
function hit(a,b){
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// ================= LOOP =================
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

  if(state === MENU){
    dino.draw();
    text("CLICK PARA JUGAR", 200, 16);
  }

  if(state === GAME){
    frames++;

    dino.vx = 0;
    if(moveLeft) dino.vx = -dino.speed;
    if(moveRight) dino.vx = dino.speed;

    dino.update();
    dino.draw();

    spawnTimer++;
    if(spawnTimer > spawnInterval){
      spawnTimer = 0;
      spawnCount++;

      if(spawnCount <= 3) enemies.push(createCactus());
      else enemies.push(Math.random()<0.5 ? createCactus() : createBird());

      if(spawnInterval > 40) spawnInterval -= 2;
    }

    enemies.forEach(e=>{
      e.x += e.vx;
      if(e.type==="cactus")
        ctx.drawImage(cactusImg,e.x,e.y,e.w,e.h);
      else{
        ctx.save();
        ctx.translate(e.x+e.w/2,e.y+e.h/2);
        ctx.scale(e.dir===1?-1:1,1);
        ctx.drawImage(birdImg,-e.w/2,-e.h/2,e.w,e.h);
        ctx.restore();
      }
      if(hit(dino,e)) state=OVER;
    });

    bullets.forEach(b=>{
      b.x += b.vx;
      ctx.fillStyle="#fff";
      ctx.fillRect(b.x,b.y,b.w,b.h);
    });

    text("Score: "+score, 20, 14, "left");
  }

  if(state === OVER){
    text("GAME OVER",180,24);
    text("CLICK PARA REINICIAR",220,14);
  }

  raf(loop);
}

function text(t,y,s,a="center"){
  ctx.fillStyle="#fff";
  ctx.font=s+"px monospace";
  ctx.textAlign=a;
  ctx.fillText(t, a==="left"?10:canvas.width/2, y);
}

loop();
