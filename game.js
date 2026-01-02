var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

// Sprites
var dinoImg = new Image(); dinoImg.src = "dino.png";
var birdImg = new Image(); birdImg.src = "bird.png";
var cactusImg = new Image(); cactusImg.src = "cactus.png";
var bgImg = new Image(); bgImg.src = "background.png";

// Estados
var MENU=0, GAME=1, OVER=2;
var state = MENU;

// ===== DINO =====
var dino = {
    x: canvas.width/2 - 37,
    y: canvas.height/2 - 30, // 🔼 30 px más arriba
    w: 74,
    h: 72,
    vx: 0,
    vy: 0,
    speed: 4,
    gravity: 0.7,
    jumpForce: -12,
    grounded: true,
    dir: 1,

    update(){
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        var groundY = canvas.height/2 - 30;
        if(this.y >= groundY){
            this.y = groundY;
            this.vy = 0;
            this.grounded = true;
        }

        if(this.x < 0) this.x = 0;
        if(this.x + this.w > canvas.width) this.x = canvas.width - this.w;
    },

    draw(){
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);
        ctx.scale(this.dir === 1 ? -1 : 1, 1);
        ctx.drawImage(dinoImg, -this.w/2, -this.h/2, this.w, this.h);
        ctx.restore();
    },

    jump(){
        if(this.grounded){
            this.vy = this.jumpForce;
            this.grounded = false;
        }
    }
};

// ===== CACTUS =====
var cactus = {
    x: canvas.width/2 - 26,
    y: canvas.height/2 - 30, // 🔼 30 px más arriba
    w: 52,
    h: 100,
    draw(){
        ctx.drawImage(cactusImg, this.x, this.y, this.w, this.h);
    }
};

// ===== ENEMIGOS =====
var enemies = [];

function spawnBird(side){
    enemies.push({
        type: "bird",
        w: 52, // 70% de 75
        h: 52,
        x: side === "left" ? 0 : canvas.width - 52,
        y: canvas.height/2 - 30 - 40, // 🔼 ajustado a nueva altura
        vx: side === "left" ? 2 : -2,
        dir: side === "left" ? 1 : -1
    });
}

// ===== CONTROLES =====
var moveLeft=false, moveRight=false;

document.getElementById("left").onmousedown = () => moveLeft=true;
document.getElementById("right").onmousedown = () => moveRight=true;
document.getElementById("left").onmouseup = () => moveLeft=false;
document.getElementById("right").onmouseup = () => moveRight=false;
document.getElementById("jump").onclick = () => dino.jump();

// ===== LOOP =====
function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

    if(state === MENU){
        dino.draw();
        cactus.draw();
        ctx.fillStyle="#fff";
        ctx.textAlign="center";
        ctx.fillText("CLICK PARA JUGAR", canvas.width/2, 160);
    }

    if(state === GAME){
        dino.vx = 0;
        if(moveLeft){ dino.vx = -dino.speed; dino.dir = -1; }
        if(moveRight){ dino.vx = dino.speed; dino.dir = 1; }

        dino.update();
        dino.draw();
        cactus.draw();

        enemies.forEach(e=>{
            e.x += e.vx;
            ctx.save();
            ctx.translate(e.x + e.w/2, e.y + e.h/2);
            ctx.scale(e.dir === 1 ? -1 : 1, 1);
            ctx.drawImage(birdImg, -e.w/2, -e.h/2, e.w, e.h);
            ctx.restore();
        });
    }

    requestAnimationFrame(loop);
}

canvas.onclick = ()=>{
    if(state === MENU) state = GAME;
};

loop();
