var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(fn){ setTimeout(fn,1000/30); };

// ===== Sprites =====
var dinoImg = new Image(); dinoImg.src = "dino.png";
var birdImg = new Image(); birdImg.src = "bird.png";
var cactusImg = new Image(); cactusImg.src = "cactus.png";

// ===== Estado =====
var LOADING=0, MENU=1, GAME=2, OVER=3;
var state = LOADING;

var frames = 0;
var score = 0;
var difficulty = 1;

var imagesLoaded = 0;
var totalImages = 3;

dinoImg.onload = checkLoad;
birdImg.onload = checkLoad;
cactusImg.onload = checkLoad;

function checkLoad(){
    imagesLoaded++;
    if(imagesLoaded>=totalImages){
        state = MENU;
        dino.reset();
        cactus.x = canvas.width/2 - cactus.w/2;
        cactus.y = canvas.height/2;
    }
}

// ===== Dino =====
var dino = {
    x: canvas.width/2 - 37,
    y: canvas.height/2,
    w: 74, h:72,
    vx:0, vy:0,
    speed:4,
    g:0.7,
    jump:-12,
    grounded:true,
    dir:1,

    draw:function(){
        ctx.save();
        ctx.translate(this.x+this.w/2, this.y+this.h/2);
        ctx.scale(this.dir===1?-1:1,1);
        if(dinoImg.complete) ctx.drawImage(dinoImg,-this.w/2,-this.h/2,this.w,this.h);
        else {ctx.fillStyle="#fff"; ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);}
        ctx.restore();
    },

    update:function(){
        this.vy += this.g;
        this.y += this.vy;
        this.x += this.vx;

        if(this.y >= canvas.height/2){
            this.y = canvas.height/2;
            this.vy = 0;
            this.grounded = true;
        }

        if(this.x<0) this.x=0;
        if(this.x+this.w>canvas.width) this.x=canvas.width-this.w;
    },

    jumpUp:function(){
        if(this.grounded){ this.vy=this.jump; this.grounded=false; }
    },

    reset:function(){
        this.x = canvas.width/2 - this.w/2;
        this.y = canvas.height/2;
        this.vx=0; this.vy=0; this.grounded=true;
        this.dir = 1;
    }
};

// ===== Cactus =====
var cactus = {x:canvas.width/2-26, y:canvas.height/2, w:52, h:100,
    draw:function(){ if(cactusImg.complete) ctx.drawImage(cactusImg,this.x,this.y,this.w,this.h); 
    else {ctx.fillStyle="#fff"; ctx.fillRect(this.x,this.y,this.w,this.h);} }
};

// ===== Balas =====
var bullets = [];
function shoot(){
    bullets.push({x:dino.x+dino.w/2-3, y:dino.y+dino.h/2-2, w:6,h:3,vx:6*dino.dir});
}

// ===== Enemigos =====
var enemies=[];
var spawnTimer=0, spawnInterval=120, spawnCounter=0;
function spawnBird(side){
    enemies.push({type:"bird", x:side==="left"?0:canvas.width-75, y:canvas.height/2-30, w:75,h:75,
        vx:side==="left"?2+difficulty*0.5:-2-difficulty*0.5, dir:side==="left"?1:-1});
}

// ===== Botones dibujados en canvas =====
var btnSize = 50;
var buttons = {
    left: {x:50, y:canvas.height/2 + 5, w:btnSize, h:btnSize, dir:-1, action:"move"},
    right:{x:150, y:canvas.height/2 + 5, w:btnSize, h:btnSize, dir:1, action:"move"},
    jump:{x:canvas.width-150, y:canvas.height/2 + 5, w:btnSize, h:btnSize, action:"jump"},
    shoot:{x:canvas.width-50, y:canvas.height/2 + 5, w:btnSize, h:btnSize, action:"shoot"}
};

function drawButtons(){
    ctx.fillStyle="#444"; ctx.strokeStyle="#fff"; ctx.lineWidth=2;
    for(var key in buttons){
        var b=buttons[key];
        ctx.fillRect(b.x,b.y,b.w,b.h);
        ctx.strokeRect(b.x,b.y,b.w,b.h);
        ctx.fillStyle="#fff"; ctx.font="24px monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
        var symbol = key==="left"?"◀":key==="right"?"▶":key==="jump"?"↑":"•";
        ctx.fillText(symbol,b.x+b.w/2,b.y+b.h/2);
        ctx.fillStyle="#444";
    }
}

// ===== Detectar clic/touch en botones =====
canvas.addEventListener("mousedown", handleClick);
canvas.addEventListener("touchstart", function(e){ handleClick(e.touches[0]); });

function handleClick(e){
    var rect=canvas.getBoundingClientRect();
    var x=e.clientX-rect.left;
    var y=e.clientY-rect.top;

    for(var key in buttons){
        var b = buttons[key];
        if(x>b.x && x<b.x+b.w && y>b.y && y<b.y+b.h){
            if(b.action==="move"){ dino.vx = b.dir*dino.speed; dino.dir=b.dir; }
            if(b.action==="jump"){ dino.jumpUp(); }
            if(b.action==="shoot"){ shoot(); }
        }
    }

    if(state===MENU) state=GAME;
    else if(state===OVER) resetGame();
}

// ===== Reset =====
function resetGame(){
    enemies=[]; bullets=[]; score=0; difficulty=1; frames=0;
    spawnTimer=0; spawnCounter=0;
    dino.reset();
}

// ===== Colisiones =====
function rectHit(a,b){ return (a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y); }

// ===== Loop =====
function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Fondo negro
    ctx.fillStyle="#000"; ctx.fillRect(0,0,canvas.width,canvas.height);
    // Suelo blanco
    ctx.fillStyle="#fff"; ctx.fillRect(0,canvas.height/2,canvas.width,2);

    // Dibujar botones
    drawButtons();

    if(state===LOADING){ drawText("Cargando sprites...",180,24); }
    if(state===MENU){
        cactus.draw(); dino.draw();
        drawText("DINO PIXEL REVENGE H",150,24);
        drawText("CLICK PARA JUGAR",200,14);
    }
    if(state===GAME){
        frames++;
        // Movimiento continuo solo al tocar botones
        if(dino.vx !==0){ dino.update(); }
        dino.update(); dino.draw();
        cactus.draw();

        // Generación progresiva de enemigos
        spawnTimer++;
        if(spawnTimer>=spawnInterval){
            spawnTimer=0; spawnCounter++;
            if(spawnCounter<=3){
                enemies.push({type:"cactus",x:Math.random()*(canvas.width-52),y:canvas.height/2,w:52,h:100});
            } else {
                if(Math.random()<0.5){
                    enemies.push({type:"cactus",x:Math.random()*(canvas.width-52),y:canvas.height/2,w:52,h:100});
                } else {
                    spawnBird(Math.random()<0.5?"left":"right");
                }
            }
            if(spawnInterval>30 && frames%300===0) spawnInterval-=5;
        }

        // Dibujar enemigos
        for(var i=0;i<enemies.length;i++){
            var e=enemies[i];
            if(e.type==="bird"){
                ctx.save();
                ctx.translate(e.x+e.w/2,e.y+e.h/2);
                ctx.scale(e.dir===1?-1:1,1);
                if(birdImg.complete) ctx.drawImage(birdImg,-e.w/2,-e.h/2,e.w,e.h);
                ctx.restore();
                e.x+=e.vx;
            } else { // cactus
                if(cactusImg.complete) ctx.drawImage(cactusImg,e.x,e.y,e.w,e.h);
            }
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
                if(rectHit(bullets[j],e)){ bullets.splice(j,1); enemies.splice(i,1); score++; break; }
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

function drawText(t,y,s){ ctx.fillStyle="#fff"; ctx.font=s+"px monospace"; ctx.textAlign="center"; ctx.fillText(t,canvas.width/2,y); }

loop();
