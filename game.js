var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var bg = new Image(); bg.src = "background.png";
var dinoImg = new Image(); dinoImg.src = "dino.png";
var birdImg = new Image(); birdImg.src = "bird.png";
var cactusImg = new Image(); cactusImg.src = "cactus.png";

var GRAVITY = 0.4;
var groundY = 260;
var speed = 2;
var frame = 0;
var difficulty = 1;

var dino = {
    x: 300, y: groundY, w: 74, h: 72,
    vx: 0, vy: 0, dir: 1,
    onGround: true
};

var bullets = [];
var enemies = [];

function shoot() {
    bullets.push({
        x: dino.x + dino.w / 2,
        y: dino.y + dino.h / 2,
        vx: dino.dir * 6,
        w: 6, h: 3
    });
}

function spawnEnemy() {
    var fromLeft = Math.random() < 0.5;
    var type = Math.random() < 0.5 ? "cactus" : "bird";

    enemies.push({
        type: type,
        x: fromLeft ? -60 : 700,
        y: type === "bird" ? 180 : groundY + 20,
        vx: fromLeft ? speed : -speed,
        w: type === "bird" ? 75 : 52,
        h: type === "bird" ? 75 : 100
    });
}

function rectsCollide(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

function update() {
    frame++;
    if (frame % 300 === 0) difficulty += 0.2;
    if (frame % Math.max(120 - difficulty * 10, 40) === 0) spawnEnemy();

    dino.x += dino.vx;
    dino.vy += GRAVITY;
    dino.y += dino.vy;

    if (dino.y >= groundY) {
        dino.y = groundY;
        dino.vy = 0;
        dino.onGround = true;
    }

    for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx;
        if (bullets[i].x < -10 || bullets[i].x > 650) bullets.splice(i, 1);
    }

    for (var i = enemies.length - 1; i >= 0; i--) {
        enemies[i].x += enemies[i].vx;

        for (var j = bullets.length - 1; j >= 0; j--) {
            if (rectsCollide(enemies[i], bullets[j])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                break;
            }
        }
    }
}

function drawButtons() {
    function btn(x, y, arrow) {
        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, 40, 40);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        if (arrow === "L") { ctx.moveTo(x+28,y+10); ctx.lineTo(x+12,y+20); ctx.lineTo(x+28,y+30); }
        if (arrow === "R") { ctx.moveTo(x+12,y+10); ctx.lineTo(x+28,y+20); ctx.lineTo(x+12,y+30); }
        if (arrow === "A") { ctx.rect(x+14,y+14,12,12); }
        ctx.fill();
    }
    btn(20,300,"L");
    btn(70,300,"R");
    btn(580,300,"A");
}

function draw() {
    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(dinoImg, dino.x, dino.y);

    for (var i=0;i<enemies.length;i++) {
        var e = enemies[i];
        ctx.drawImage(e.type==="bird"?birdImg:cactusImg, e.x, e.y);
    }

    ctx.fillStyle = "#fff";
    for (var i=0;i<bullets.length;i++) {
        ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].w, bullets[i].h);
    }

    drawButtons();
}

function loop() {
    update();
    draw();
    setTimeout(loop, 1000/30);
}

canvas.addEventListener("mousedown", function(e){
    var x = e.offsetX, y = e.offsetY;
    if (y > 300 && x < 60) { dino.vx = -3; dino.dir = -1; }
    else if (y > 300 && x < 120) { dino.vx = 3; dino.dir = 1; }
    else if (x > 560) shoot();
});

loop();