var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var leftBtn = document.getElementById("left");
var rightBtn = document.getElementById("right");
var jumpBtn = document.getElementById("jump");
var shootBtn = document.getElementById("shoot");

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(fn){ setTimeout(fn, 1000/30); };

// Sprites
var dinoImg = new Image();
dinoImg.src = "dino.png"; // 74x72
var birdImg = new Image();
birdImg.src = "bird.png"; // 75x75
var cactusImg = new Image();
cactusImg.src = "cactus.png"; // 52x100
var bgImg = new Image();
bgImg.src = "background.png"; // 640x360

var MENU=0, GAME=1, OVER=2;
var state = MENU;

var frames = 0;
var score = 0;
var difficulty = 1;

// ===== Dino =====
var dino = {
    x: canvas.width/2 - 37,
    y: canvas.height/2 + 30,
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
        ctx.translate(this.x+this.w/2,this.y+this.h/2);
        ctx.rotate(this.dir===1?0:Math.PI);
        if(dinoImg.complete) ctx.drawImage(dinoImg,-this.w/2,-this.h/2,this.w,this.h);
        else {
            ctx.fillStyle="#7CFC00";
            ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);
        }
        ctx.restore();
    },

    update:function(){
        this.vy+=this.g;
        this.y+=this.vy;
        this.x+=this.vx;

        if(this.y>=canvas.height/2 + 30){
            this.y=canvas.height/2 + 30;
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
        this.y=canvas.height/2 + 30;
        this.vx=0;
        this.vy=0;
        this.grounded=true;
        this.dir=1;
    }
};

// ===== Bullets =====
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

// ===== Enemigos =====
var enemies=[];

function spawnCactus(){
    enemies.push({
        type:"cactus",
        x:canvas.width/2 - 26,
        y:canvas.height/2 + 30,
        w:52,
        h:100
    });
}

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

// ===== CONTROLES =====
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

// ===== RESET =====
function resetGame(){
    enemies=[];
    bullets=[];
    score=0;
    difficulty=1;
    frames=0;
    dino.reset();
}

// ===== COLISION =====
function rectHit(a,b){
    return (a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y);
}

// ===== LOOP =====
function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(bgImg.complete) ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

    if(state===MENU){
        drawText("DINO PIXEL REVENGE H",180,24);
        drawText("CLICK PARA JUGAR",220,14);
    }

    if(state===GAME){
        frames++;

        // Actualizar dino según botones
        dino.vx=0;
        if(moveLeft) dino.vx=-dino.speed;
        if(moveRight) dino.vx=dino.speed;

        dino.update();
        dino.draw();

        // Solo generar enemigos después de 5 segundos (~300 frames)
        if(frames===300){
            spawnCactus();
            spawnBird("left");
            spawnBird("right");
        }

        // Generar pájaros de vez en cuando después del inicio
        if(frames>300 && frames%300===0){
            spawnBird("left");
            spawnBird("right");
        }

        // Dibujar enemigos
        for(var i=0;i<enemies.length;i++){
            var e=enemies[i];
            ctx.save();
            ctx.translate(e.x+e.w/2,e.y+e.h/2);
            if(e.type==="bird") ctx.rotate(e.dir===1?0:Math.PI);
            if(e.type==="cactus" && cactusImg.complete) ctx.drawImage(cactusImg,-e.w/2,-e.h/2,e.w,e.h);
            if(e.type==="bird" && birdImg.complete) ctx.drawImage(birdImg,-e.w/2,-e.h/2,e.w,e.h);
            ctx.restore();
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
