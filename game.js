const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameOver = false;
let win = false;

const player = {
    name: "Poor Med Student",
    x: 80,
    y: 80,
    size: 30,
    speed: 3,
    fries: []
};

const obstacles = [
    {x:200,y:200,w:200,h:40},
    {x:500,y:100,w:40,h:200},
    {x:300,y:400,w:300,h:40}
];

const enemies = [
    {x:500,y:300,size:30,dir:1,speed:1.5,hp:1},
    {x:700,y:500,size:30,dir:-1,speed:2,hp:1}
];

const goal = {x: 800, y: 80, w: 50, h: 60};

let keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("contextmenu", e => {
    e.preventDefault();
    shootFries(e.offsetX, e.offsetY);
});

function playKaboom() {
    const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctxAudio.createOscillator();
    const g = ctxAudio.createGain();
    o.connect(g);
    g.connect(ctxAudio.destination);
    o.type = "square";
    o.frequency.setValueAtTime(100, ctxAudio.currentTime);
    g.gain.setValueAtTime(0.5, ctxAudio.currentTime);
    o.start();
    o.frequency.exponentialRampToValueAtTime(40, ctxAudio.currentTime + 0.4);
    g.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.4);
    o.stop(ctxAudio.currentTime + 0.4);
}

function shootFries(targetX, targetY) {
    if (gameOver) return;
    const angle = Math.atan2(targetY - player.y, targetX - player.x);
    player.fries.push({
        x: player.x,
        y: player.y,
        size: 10,
        dx: Math.cos(angle) * 6,
        dy: Math.sin(angle) * 6
    });
    playKaboom();
}

function movePlayer() {
    if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
    if (keys["arrowdown"] || keys["s"]) player.y += player.speed;
    if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
    if (keys["arrowright"] || keys["d"]) player.x += player.speed;
}

function moveEnemies() {
    enemies.forEach(e => {
        e.x += e.dir * e.speed;
        if (e.x < 100 || e.x > canvas.width - 100) e.dir *= -1;
    });
}

function moveFries() {
    player.fries.forEach(f => {
        f.x += f.dx;
        f.y += f.dy;
    });
    player.fries = player.fries.filter(f => f.x > 0 && f.x < canvas.width && f.y > 0 && f.y < canvas.height);
}

function checkCollisions() {
    player.fries.forEach((f, fi) => {
        enemies.forEach((e, ei) => {
            if (Math.hypot(f.x - e.x, f.y - e.y) < (f.size + e.size) / 2) {
                e.hp = 0;
                player.fries.splice(fi, 1);
            }
        });
    });
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) enemies.splice(i, 1);
    }
    if (player.x > goal.x && player.x < goal.x + goal.w &&
        player.y > goal.y && player.y < goal.y + goal.h) {
        win = true;
        gameOver = true;
    }
}

function drawPlayer() {
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0000ff";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 20, player.y + 20);
    ctx.lineTo(player.x + 20, player.y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.fillText(player.name, player.x - 30, player.y - player.size);
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = "#fff0aa";
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, e.size/2, e.size*0.7, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.font = "12px sans-serif";
        ctx.fillText("Ahmed Taha", e.x - 30, e.y - e.size);
    });
}

function drawFries() {
    ctx.fillStyle = "#ffcc00";
    player.fries.forEach(f => {
        ctx.fillRect(f.x - f.size/2, f.y - f.size/2, f.size, f.size);
    });
}

function drawObstacles() {
    ctx.fillStyle = "#654321";
    obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });
}

function drawGoal() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
    ctx.fillStyle = "#000";
    ctx.font = "10px sans-serif";
    ctx.fillText("The Only Pharma", goal.x - 15, goal.y + 20);
    ctx.fillText("Reference You", goal.x - 10, goal.y + 35);
    ctx.fillText("Need", goal.x + 5, goal.y + 50);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    moveEnemies();
    moveFries();
    checkCollisions();

    drawObstacles();
    drawGoal();
    drawPlayer();
    drawEnemies();
    drawFries();

    if (gameOver) {
        document.getElementById("messageBox").textContent = win ? "🎉 You Win!" : "💀 Game Over";
    } else {
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();
