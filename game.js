var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var bg = new Image();
bg.src = "background.png";

var dinoImg = new Image();
dinoImg.src = "dino.png";

var birdImg = new Image();
birdImg.src = "bird.png";

var cactusImg = new Image();
cactusImg.src = "cactus.png";

var GRAVITY = 0.35;
var GROUND_Y = 230; // bajado un poco

var dino = {
    x: canvas.width / 2 - 37,
    y: GROUND_Y,
    w: 74,
    h: 72,
    vy: 0,
    dir: 1,
    jump: function () {
        if (this.y >= GROUND_Y) this.vy = -7;
    },
    update: function () {
        this.vy += GRAVITY;
        this.y += this.vy;
        if (this.y > GROUND_Y) {
            this.y = GROUND_Y;
            this.vy = 0;
        }
    },
    draw: function () {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.dir === 1 ? Math.PI / 2 : -Math.PI / 2);
        ctx.drawImage(dinoImg, -this.h / 2, -this.w / 2, this.h, this.w);
        ctx.restore();
    }
};

var bullets = [];
function shoot() {
    bullets.push({
        x: dino.x + dino.w / 2,
        y: dino.y + dino.h / 2,
        vx: dino.dir * 6
    });
}

var enemies = [];

function spawnEnemy() {
    var fromLeft = Math.random() < 0.5;
    enemies.push({
        x: fromLeft ? -60 : canvas.width + 60,
        y: GROUND_Y + 10,
        w: 52,
        h: 100,
        vx: fromLeft ? 2 : -2,
        img: Math.random() < 0.5 ? cactusImg : birdImg
    });
}

var timer = 0;

function drawButtons() {
    var left = document.getElementById("left");
    var right = document.getElementById("right");
    var jump = document.getElementById("jump");

    left.innerHTML = right.innerHTML = jump.innerHTML = "";

    drawArrow(left, "left");
    drawArrow(right, "right");
    drawArrow(jump, "up");
}

function drawArrow(el, dir) {
    var c = document.createElement("canvas");
    c.width = c.height = 60;
    var x = c.getContext("2d");

    x.fillStyle = "#333";
    x.fillRect(0,0,60,60);

    x.fillStyle = "#aaa";
    x.beginPath();
    if (dir === "left") {
        x.moveTo(40,10); x.lineTo(20,30); x.lineTo(40,50);
    }
    if (dir === "right") {
        x.moveTo(20,10); x.lineTo(40,30); x.lineTo(20,50);
    }
    if (dir === "up") {
        x.moveTo(10,40); x.lineTo(30,20); x.lineTo(50,40);
    }
    x.fill();

    el.appendChild(c);
}

drawButtons();

document.getElementById("left").ontouchstart =
document.getElementById("left").onmousedown = function () {
    dino.x -= 5;
    dino.dir = -1;
};

document.getElementById("right").ontouchstart =
document.getElementById("right").onmousedown = function () {
    dino.x += 5;
    dino.dir = 1;
};

document.getElementById("jump").ontouchstart =
document.getElementById("jump").onmousedown = function () {
    dino.jump();
    shoot();
};

function loop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (bg.complete) ctx.drawImage(bg,0,0);

    dino.update();
    dino.draw();

    for (var i=0;i<bullets.length;i++){
        bullets[i].x += bullets[i].vx;
        ctx.fillStyle="#fff";
        ctx.fillRect(bullets[i].x, bullets[i].y, 6, 2);
    }

    for (var e=0;e<enemies.length;e++){
        enemies[e].x += enemies[e].vx;
        ctx.drawImage(enemies[e].img, enemies[e].x, enemies[e].y,
                      enemies[e].w, enemies[e].h);
    }

    timer++;
    if (timer % 120 === 0) spawnEnemy();

    requestAnimationFrame(loop);
}

loop();
