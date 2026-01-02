var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var bg = new Image(); bg.src = "background.png";
var dinoImg = new Image(); dinoImg.src = "dino.png";
var birdImg = new Image(); birdImg.src = "bird.png";
var cactusImg = new Image(); cactusImg.src = "cactus.png";

var GRAVITY = 0.4;
var GROUND_Y = 230;

var keys = { left:false, right:false };

var dino = {
    x: canvas.width/2 - 37,
    y: GROUND_Y,
    w: 74,
    h: 72,
    vx: 0,
    vy: 0,
    speed: 2.2,
    dir: 1,
    onGround: true
};

var enemies = [];

function spawnEnemy() {
    var side = Math.random() < 0.5 ? "left" : "right";
    enemies.push({
        x: side === "left" ? -60 : canvas.width + 60,
        y: GROUND_Y + 10,
        w: 52,
        h: 100,
        vx: side === "left" ? 1.4 : -1.4,
        dir: side === "left" ? 1 : -1,
        type: "cactus"
    });
}

function spawnBird() {
    var side = Math.random() < 0.5 ? "left" : "right";
    enemies.push({
        x: side === "left" ? -80 : canvas.width + 80,
        y: 170,
        w: 75,
        h: 75,
        vx: side === "left" ? 1.8 : -1.8,
        dir: side === "left" ? 1 : -1,
        type: "bird"
    });
}

var spawnTimer = 0;

function update() {

    // MOVIMIENTO SOLO SI SE PRESIONA
    dino.vx = 0;
    if (keys.left) { dino.vx = -dino.speed; dino.dir = -1; }
    if (keys.right) { dino.vx = dino.speed; dino.dir = 1; }

    dino.x += dino.vx;

    // NO SALIR DE PANTALLA
    if (dino.x < 0) dino.x = 0;
    if (dino.x + dino.w > canvas.width) dino.x = canvas.width - dino.w;

    // GRAVEDAD
    dino.vy += GRAVITY;
    dino.y += dino.vy;

    if (dino.y >= GROUND_Y) {
        dino.y = GROUND_Y;
        dino.vy = 0;
        dino.onGround = true;
    }

    spawnTimer++;
    if (spawnTimer % 120 === 0) spawnEnemy();
    if (spawnTimer % 200 === 0) spawnBird();

    for (var i = enemies.length-1; i >= 0; i--) {
        var e = enemies[i];
        e.x += e.vx;

        // COLISION
        if (
            dino.x < e.x + e.w &&
            dino.x + dino.w > e.x &&
            dino.y < e.y + e.h &&
            dino.y + dino.h > e.y
        ) {
            alert("Game Over");
            location.reload();
        }

        if (e.x < -200 || e.x > canvas.width + 200) {
            enemies.splice(i,1);
        }
    }
}

function drawRotated(img, x, y, w, h, dir) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate(dir === 1 ? Math.PI/2 : -Math.PI/2);
    ctx.drawImage(img, -h/2, -w/2, h, w);
    ctx.restore();
}

function drawButton(x, y, type) {
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, 64, 64);
    ctx.strokeStyle = "#777";
    ctx.strokeRect(x, y, 64, 64);

    ctx.fillStyle = "#ccc";
    ctx.beginPath();

    if (type === "left") {
        ctx.moveTo(x+20, y+32);
        ctx.lineTo(x+44, y+16);
        ctx.lineTo(x+44, y+48);
    } else if (type === "right") {
        ctx.moveTo(x+44, y+32);
        ctx.lineTo(x+20, y+16);
        ctx.lineTo(x+20, y+48);
    } else {
        ctx.rect(x+24, y+20, 16, 24);
    }

    ctx.fill();
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (bg.complete) ctx.drawImage(bg,0,0);

    drawRotated(dinoImg, dino.x, dino.y, dino.w, dino.h, dino.dir);

    for (var i=0;i<enemies.length;i++) {
        var e = enemies[i];
        if (e.type === "bird")
            drawRotated(birdImg, e.x, e.y, e.w, e.h, e.dir);
        else
            ctx.drawImage(cactusImg, e.x, e.y, e.w, e.h);
    }

    drawButton(20, canvas.height-74, "left");
    drawButton(100, canvas.height-74, "right");
    drawButton(canvas.width-84, canvas.height-74, "jump");
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();

// CONTROLES TÁCTILES
function bind(id, down, up) {
    var el = document.getElementById(id);
    el.addEventListener("touchstart", function(e){e.preventDefault();down();});
    el.addEventListener("touchend", function(e){e.preventDefault();up();});
}

bind("left", function(){keys.left=true;}, function(){keys.left=false;});
bind("right", function(){keys.right=true;}, function(){keys.right=false;});
bind("jump", function(){
    if (dino.onGround) {
        dino.vy = -7;
        dino.onGround = false;
    }
}, function(){});
