var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var leftBtn = document.getElementById("left");
var rightBtn = document.getElementById("right");
var jumpBtn = document.getElementById("jump");
var shootBtn = document.getElementById("shoot");

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(fn){ setTimeout(fn, 1000/30); };

// ===== Sprites =====
var dinoImg = new Image(); dinoImg.src = "dino.png";
var birdImg = new Image(); birdImg.src = "bird.png";
var cactusImg = new Image(); cactusImg.src = "cactus.png";
var bgImg = new Image(); bgImg.src = "background.png";

// ===== Estado del juego =====
var LOADING=0, MENU=1, GAME=2, OVER=3;
var state = LOADING;

var frames = 0;
var score = 0;
var difficulty = 1;

var imagesLoaded = 0;
var totalImages = 4;

// ===== Esperar carga de sprites =====
dinoImg.onload = checkLoad;
birdImg.onload = checkLoad;
cactusImg.onload = checkLoad;
bgImg.onload = checkLoad;

function checkLoad() {
    imagesLoaded++;
    if(imagesLoaded >= totalImages){
        state = MENU; // pasa al menú
        // Posicionar dino y cactus al "suelo" (altura del texto "CLICK PARA JUGAR")
        dino.reset();
        cactus.x = canvas.width/2 - cactus.w/2;
        cactus.y = canvas.height/2 + 40;
    }
}

// ===== Dino =====
var dino = {
    x: canvas.width/2 - 37,
    y: canvas.height/2 + 40,
    w: 74,
    h: 72,
    vy: 0,
    vx: 0,
    speed: 4,
    g: 0.7,
    jump:-12,
    grounded:true,
    dir:1, // 1=derecha, -1=izquierda

    draw:function(){
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);
        ctx.scale(this.dir===1?1:-1,1); // espejo horizontal según dirección
        if(dinoImg.complete){
            ctx.drawImage(dinoImg,-this.w/2,-this.h/2,this.w,this.h);
        } else {
            ctx.fillStyle="#777"; // temporal mientras carga
            ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);
        }
        ctx.restore();
    },

    update:function(){
        this.vy+=this.g;
        this.y+=this.vy;
        this.x+=this.vx;

        if(this.y>=canvas.height/2 + 40){ 
            this.y=canvas.height/2 + 40; 
            this.vy=0; 
            this.grounded=true; 
        }

        if(this.x<0) this.x=0;
        if(this.x+this.w>canvas.width) this.x=canvas.width-this.w;
    },

    jumpUp:function(){
        if(this.grounded){
            this.vy=this.jump;
            this.grounded=false;
        }
    },

    reset:function(){
        this.x=canvas.width/2 - this.w/2;
        this.y=canvas.height/2 + 40;
        this.vx=0;
        this.vy=0;
        this.grounded=true;
        this.dir=1;
    }
};

// ===== Cactus =====
var cactus = {
    x: canvas.width/2 - 26,
    y: canvas.height/2 + 40,
    w: 52,
    h: 100,
    draw:function(){
        if(cactusImg.complete) ctx.drawImage(cactusImg,this.x,this.y,this.w,this.h);
        else ctx.fillStyle="#ff4444"; ctx.fillRect(this.x,this.y,this.w,this.h);
    }
};

// ===== Balas =====
var bullets=[];
function shoot(){
    bullets.push({
        x:dino.x+dino.w/2 - 3,
        y:dino.y + dino.h/2 - 2,
        w:6,
        h:3,
        vx:6*dino.dir
    });
}

// ===== Enemigos voladores =====
var enemies=[];
function spawnBird(side){
    enemies.push({
        type:"bird",
        x:side==="left"?0:canvas.width-75,
        y:canvas.height/2 - 30,
        w:75,
        h:75,
        vx: side==="left"?2 + difficulty*0.5 : -2 - difficulty*0.5,
        dir: side==="left"?1:-1
    });
}

// ===== Controles =====
var moveLeft=false;
var moveRight=false;

leftBtn.onmousedown=leftBtn.ontouchstart=function(){moveLeft=true; dino.dir=-1;};
leftBtn.onmouseup=leftBtn.ontouchend=function(){moveLeft=false;};
rightBtn.onmousedown=rightBtn.ontouchstart=function(){moveRight=true; dino.dir=1;};
rightBtn.onmouseup=rightBtn.ontouchend=function(){moveRight=false;};
jumpBtn.onclick=jumpBtn.ontouchstart=function(){if(state===GAME)dino.jumpUp();};
shootBtn.onclick=shootBtn.ontouchstart=function(){if(state===GAME)shoot();};

canvas.onclick=function(){
    if(state===MENU) state=GAME;
    else if(state===OVER) resetGame();
};

// ===== Reset =====
function resetGame(){
    enemies=[];
    bullets=[];
    score=0;
    difficulty=1;
    frames=0;
    dino.reset();
}

// ===== Colisión =====
function rectHit(a,b){
    return (a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y);
}

// ===== Loop =====
function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(bgImg.complete) ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

    if(state===LOADING){
        drawText("Cargando sprites...",180,24);
    }

    if(state===MENU){
        // Dibujar cactus y dino al "suelo"
        cactus.draw();
        dino.draw();
        drawText("DINO PIXEL REVENGE H",150,24);
        drawText("CLICK PARA JUGAR",200,14);
    }

    if(state===GAME){
        frames++;

        // Actualizar dino según botones
        dino.vx=0;
        if(moveLeft) dino.vx=-dino.speed;
        if(moveRight) dino.vx=dino.speed;

        dino.update();
        dino.draw();

        // Generar pájaros después de 5s
        if(frames===300){
            spawnBird("left");
            spawnBird("right");
        }
        if(frames>300 && frames%300===0){
            spawnBird("left");
            spawnBird("right");
        }

        // Dibujar enemigos voladores
        for(var i=0;i<enemies.length;i++){
            var e=enemies[i];
            ctx.save();
            ctx.translate(e.x+e.w/2,e.y+e.h/2);
            if(e.type==="bird"){
                ctx.scale(e.dir===1?1:-1,1); // espejo horizontal
                if(birdImg.complete) ctx.drawImage(birdImg,-e.w/2,-e.h/2,e.w,e.h);
            }
            ctx.restore();
            e.x += e.vx;
        }

        // Balas
        for(var i=0;i<bullets.length;i++){
            bullets[i].x+=bullets[i].vx;
            ctx.fillStyle="#ffff00";
            ctx.fillRect(bullets[i].x,bullets[i].y,bullets[i].w,bullets[i].h);
        }

        // Colisiones
        for(var i=enemies.length-1;i>=0;i--){
            var e=enemies[i];
            if(rectHit(dino,e)) state=OVER;
            for(var j=bullets.length-1;j>=0;j--){
                var b=bullets[j];
                if(rectHit(b,e)){
                    bullets.splice(j,1);
                    enemies.splice(i,1);
                    score++;
                    break;
                }
            }
        }

        drawText("Score: "+score,50,14);
    }

    if(state===OVER){
        drawText("GAME OVER",180,26);
        drawText("Score: "+score,220,16);
        drawText("CLICK PARA REINICIAR",250,14);
    }

    raf(loop);
}

function drawText(t,y,s){
    ctx.fillStyle="#fff";
    ctx.font=s+"px monospace";
    ctx.textAlign="center";
    ctx.fillText(t,canvas.width/2,y);
}

loop();
