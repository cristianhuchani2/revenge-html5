var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

// ===== FPS LIMIT =====
var FPS = 30;
var fpsInterval = 1000 / FPS;
var lastTime = 0;

// ===== IMÁGENES =====
var dinoImg = new Image(); dinoImg.src = "dino.png";
var birdImg = new Image(); birdImg.src = "bird.png";
var cactusImg = new Image(); cactusImg.src = "cactus.png";
var bgImg = new Image(); bgImg.src = "background.png";

// ===== ESTADOS =====
var LOADING=0, MENU=1, GAME=2, PAUSE=3, OVER=4;
var state = LOADING;

// ===== CARGA =====
var loaded = 0;
[dinoImg,birdImg,cactusImg,bgImg].forEach(img=>{
  img.onload = ()=>{
    loaded++;
    if(loaded===4){
      state = MENU;
      resetGame();
    }
  };
});

// ===== CONFIG =====
var dinoGroundY = 236;

// ===== DINO =====
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
  alive:true,

  update(){
    if(!this.alive) return;

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
    ctx.translate(this.x+this.w/2,this.y+this.h/2);
    ctx.scale(this.dir===1?-1:1,1);
    ctx.drawImage(dinoImg,-this.w/2,-this.h/2,this.w,this.h);
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
    this.alive = true;
  }
};

// ===== ENEMIGOS =====
var enemies = [];
var spawnTimer = 0;
var birdUnlockTime = 10*FPS; // pájaros después de 10 segundos

function createCactus(){
  var left = Math.random()<0.5;
  return {
    type:"cactus",
    x: left ? -60 : canvas.width,
    y: dinoGroundY,
    w:52, h:100,
    vx: left ? 2 : -2
  };
}

function createBird(){
  var left = Math.random()<0.5;
  var s = 0.7;
  return {
    type:"bird",
    x: left ? -60 : canvas.width,
    y: dinoGroundY - 40,
    w:75*s, h:75*s,
    vx: left ? 2 : -2,
    dir: left ? 1 : -1
  };
}

// ===== BALAS =====
var bullets = [];
function shoot(){
  bullets.push({
    x: dino.x + dino.w/2,
    y: dino.y + dino.h/2,
    w:6, h:3,
    vx: 6 * dino.dir
  });
}

// ===== CONTROLES =====
var moveLeft=false, moveRight=false;

left.onmousedown = left.ontouchstart = ()=>{ moveLeft=true; dino.dir=-1; };
left.onmouseup   = left.ontouchend   = ()=> moveLeft=false;
right.onmousedown = right.ontouchstart = ()=>{ moveRight=true; dino.dir=1; };
right.onmouseup   = right.ontouchend   = ()=> moveRight=false;

jump.onclick = jump.ontouchstart = e=>{
  e.stopPropagation();
  if(state===GAME) dino.jumpUp();
};
shoot.onclick = shoot.ontouchstart = e=>{
  e.stopPropagation();
  if(state===GAME) shoot();
};

// ===== PAUSA =====
var pausePressed = false;
pause.onclick = pause.ontouchstart = ()=>{
  if(!pausePressed){
    pausePressed = true;
    if(state===GAME) state=PAUSE;
    else if(state===PAUSE) state=GAME;
    setTimeout(()=>{pausePressed=false;},200);
  }
};

// ===== TECLADO =====
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowLeft"){ moveLeft=true; dino.dir=-1; }
  if(e.key==="ArrowRight"){ moveRight=true; dino.dir=1; }
  if(e.key==="ArrowUp" || e.key===" ") dino.jumpUp();
  if(e.key==="z"||e.key==="x") shoot();
  if(e.key==="p"||e.key==="P"){
    if(state===GAME) state=PAUSE;
    else if(state===PAUSE) state=GAME;
  }
});

document.addEventListener("keyup", e=>{
  if(e.key==="ArrowLeft") moveLeft=false;
  if(e.key==="ArrowRight") moveRight=false;
});

// ===== RESET =====
function resetGame(){
  enemies = [];
  bullets = [];
  spawnTimer = 0;
  dino.reset();
}

// ===== INICIO DESDE MENU =====
canvas.onclick = function(){
  if(state===MENU){
    state = GAME;
    resetGame();
  }
};

// ===== COLLISIONES =====
function checkCollisions(){
  enemies.forEach(e=>{
    if(dino.alive &&
      dino.x < e.x+e.w &&
      dino.x+dino.w > e.x &&
      dino.y < e.y+e.h &&
      dino.y+dino.h > e.y
    ){
      dino.alive = false;
      state = OVER;
    }
  });
}

// ===== LOOP 30FPS =====
function loop(timestamp){
  if(timestamp - lastTime < fpsInterval){
    requestAnimationFrame(loop);
    return;
  }
  lastTime = timestamp;

  if(bgImg.complete)
    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
  else{
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  if(state===LOADING){
    text("CARGANDO...",180,16);
  }

  if(state===MENU){
    dino.draw();
    text("CLICK PARA JUGAR",200,16);
  }

  if(state===PAUSE){
    dino.draw();
    enemies.forEach(e=>drawEnemy(e));
    text("PAUSA",180,24);
    requestAnimationFrame(loop);
    return;
  }

  if(state===GAME){
    dino.vx=0;
    if(moveLeft) dino.vx=-dino.speed;
    if(moveRight) dino.vx=dino.speed;

    dino.update();
    dino.draw();

    // SPAWN DE ENEMIGOS PROGRESIVO
    spawnTimer++;
    if(spawnTimer>90){ // cada 3 segundos aprox
      spawnTimer=0;
      if(spawnTimer < birdUnlockTime){
        enemies.push(createCactus());
      } else {
        enemies.push(Math.random()<0.5?createCactus():createBird());
      }
    }

    enemies = enemies.filter(e=> e.x+e.w>0 && e.x<canvas.width ); // optimización fuera de pantalla

    enemies.forEach(e=>{
      e.x += e.vx;
      drawEnemy(e);
    });

    bullets.forEach(b=>{
      b.x += b.vx;
      ctx.fillStyle="#fff";
      ctx.fillRect(b.x,b.y,b.w,b.h);
    });

    checkCollisions();
  }

  requestAnimationFrame(loop);
}

function drawEnemy(e){
  if(e.type==="cactus")
    ctx.drawImage(cactusImg,e.x,e.y,e.w,e.h);
  else{
    ctx.save();
    ctx.translate(e.x+e.w/2,e.y+e.h/2);
    ctx.scale(e.dir===1?-1:1,1);
    ctx.drawImage(birdImg,-e.w/2,-e.h/2,e.w,e.h);
    ctx.restore();
  }
}

function text(t,y,s){
  ctx.fillStyle="#fff";
  ctx.font=(s||16)+"px monospace";
  ctx.textAlign="center";
  ctx.fillText(t,canvas.width/2,y);
}

// ===== INICIO =====
requestAnimationFrame(loop);
