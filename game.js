var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var raf = window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          function(fn){ setTimeout(fn,1000/30); };

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
  }
};

// ===== ENEMIGOS =====
var enemies = [];
var spawnTimer = 0;

function createCactus(){
  var left = Math.random()<0.5;
  return {
    type:"cactus",
    x: left ? -60 : canvas.width,
    y: dinoGroundY + 10,
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

jump.onclick = jump.ontouchstart = ()=>{ if(state===GAME) dino.jumpUp(); };
shoot.onclick = shoot.ontouchstart = ()=>{ if(state===GAME) shoot(); };

// ===== PAUSA =====
pause.onclick = pause.ontouchstart = ()=>{
  if(state===GAME) state=PAUSE;
  else if(state===PAUSE) state=GAME;
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

// ===== MUSICA RETRO =====
var audioCtx = null;
var musicInterval = null;
var musicOn = false;

function startMusic(){
  if(musicOn) return;
  musicOn = true;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [262, 330, 392, 330, 262, 330, 440, 392]; // simple loop
  let i = 0;
  musicInterval = setInterval(()=>{
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = notes[i % notes.length];
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
    i++;
  }, 180);
}

// Arrancar música desde el menú y nunca detener
document.addEventListener("click",()=>{
  if(!musicOn) startMusic();
});

// ===== LOOP =====
function loop(){
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
    raf(loop); return;
  }

  if(state===GAME){
    dino.vx=0;
    if(moveLeft) dino.vx=-dino.speed;
    if(moveRight) dino.vx=dino.speed;

    dino.update();
    dino.draw();

    spawnTimer++;
    if(spawnTimer>120){
      spawnTimer=0;
      enemies.push(Math.random()<0.5?createCactus():createBird());
    }

    enemies.forEach(e=>{
      e.x += e.vx;
      drawEnemy(e);
    });

    bullets.forEach(b=>{
      b.x += b.vx;
      ctx.fillStyle="#fff";
      ctx.fillRect(b.x,b.y,b.w,b.h);
    });
  }

  raf(loop);
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

loop();
