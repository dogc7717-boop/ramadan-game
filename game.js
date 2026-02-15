/**
 * Block SAm - Official Game Engine
 * Features: Bomb System, Fever Mode, Rotation, Ghost Piece, PWA
 */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("scoreText");
const feverBar = document.getElementById("fever-bar");

// --- 1. الإعدادات والثوابت ---
const GRID_SIZE = 8;
let cellSize = canvas.width / GRID_SIZE;
let board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#a855f7"];

let state = {
    score: 0,
    highScore: localStorage.getItem("bsHigh") || 0,
    feverEnergy: 0,
    isFever: false,
    isDragging: false,
    selectedDockIndex: -1,
    dockShapes: [null, null, null],
    dragPos: { x: 0, y: 0 }
};

const patterns = [
    [[1]], [[1,1]], [[1],[1]], [[1,1,1]], [[1,1],[1,1]], [[1,1,1],[0,1,0]], [[1,0],[1,1]]
];

// --- 2. محرك الصوت (بدون ملفات خارجية) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, type = 'sine', duration = 0.2) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// --- 3. منطق اللعبة (Logic) ---

function rotateMatrix(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function createShape() {
    const idx = Math.floor(Math.random() * patterns.length);
    const color = colors[Math.floor(Math.random() * colors.length)];
    // فرصة 15% لظهور قنبلة
    const isBomb = Math.random() < 0.15;
    return {
        pattern: patterns[idx],
        color: color,
        isBomb: isBomb,
        bombTimer: 6,
        id: Math.random()
    };
}

function refreshDock() {
    if (state.dockShapes.every(s => s === null)) {
        state.dockShapes = [createShape(), createShape(), createShape()];
        renderDock();
    }
}

function canPlace(pattern, startX, startY) {
    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x]) {
                let gx = startX + x;
                let gy = startY + y;
                if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE || board[gy][gx]) return false;
            }
        }
    }
    return true;
}

function placeShape(shape, gx, gy) {
    shape.pattern.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                board[gy + y][gx + x] = {
                    color: shape.color,
                    isBomb: shape.isBomb,
                    timer: shape.bombTimer
                };
            }
        });
    });
    checkLines();
    updateBombs();
}

function updateBombs() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (board[y][x] && board[y][x].isBomb) {
                board[y][x].timer--;
                if (board[y][x].timer <= 0) gameOver("انفجرت القنبلة! 💣");
            }
        }
    }
}

function checkLines() {
    let linesCleared = 0;
    let rowsToClear = [];
    let colsToClear = [];

    for (let i = 0; i < GRID_SIZE; i++) {
        if (board[i].every(cell => cell !== 0)) rowsToClear.push(i);
        if (board.map(row => row[i]).every(cell => cell !== 0)) colsToClear.push(i);
    }

    rowsToClear.forEach(y => {
        for (let x = 0; x < GRID_SIZE; x++) board[y][x] = 0;
        linesCleared++;
    });
    colsToClear.forEach(x => {
        for (let y = 0; y < GRID_SIZE; y++) board[y][x] = 0;
        linesCleared++;
    });

    if (linesCleared > 0) {
        let points = linesCleared * 10 * (state.isFever ? 2 : 1);
        state.score += points;
        scoreText.innerText = state.score;
        updateFever(linesCleared * 15);
        playSound(440 + (linesCleared * 100), 'triangle');
    }
}

function updateFever(amount) {
    state.feverEnergy = Math.min(100, state.feverEnergy + amount);
    feverBar.style.width = state.feverEnergy + "%";
    if (state.feverEnergy >= 100 && !state.isFever) {
        state.isFever = true;
        playSound(880, 'square', 0.5);
        setTimeout(() => {
            state.isFever = false;
            state.feverEnergy = 0;
            feverBar.style.width = "0%";
        }, 8000);
    }
}

// --- 4. الرسم (Rendering) ---

function drawBlock(c, x, y, size, color, isBomb, timer, isGhost = false) {
    c.save();
    c.globalAlpha = isGhost ? 0.3 : 1;
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(x * size + 2, y * size + 2, size - 4, size - 4, 8);
    c.fill();
    
    // لمعة 3D
    c.fillStyle = "rgba(255,255,255,0.2)";
    c.fillRect(x*size+4, y*size+4, size-8, size/3);

    if (isBomb) {
        c.fillStyle = "white";
        c.font = `bold ${size/2}px Arial`;
        c.textAlign = "center";
        c.fillText(timer, x*size + size/2, y*size + size/1.5);
    }
    c.restore();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الشبكة
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
            if (board[y][x]) {
                const b = board[y][x];
                drawBlock(ctx, x, y, cellSize, b.color, b.isBomb, b.timer);
            }
        }
    }

    // رسم الـ Ghost والقطعة المسحوبة
    if (state.isDragging && state.selectedDockIndex !== -1) {
        const shape = state.dockShapes[state.selectedDockIndex];
        const rect = canvas.getBoundingClientRect();
        const gx = Math.round((state.dragPos.x - rect.left) / cellSize - 1);
        const gy = Math.round((state.dragPos.y - rect.top) / cellSize - 1);

        if (canPlace(shape.pattern, gx, gy)) {
            shape.pattern.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) drawBlock(ctx, gx + x, gy + y, cellSize, shape.color, shape.isBomb, shape.bombTimer, true);
                });
            });
        }

        // القطعة تحت الصباع
        shape.pattern.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const tx = (state.dragPos.x - rect.left) / cellSize + x - 1;
                    const ty = (state.dragPos.y - rect.top) / cellSize + y - 1;
                    drawBlock(ctx, tx, ty, cellSize, shape.color, shape.isBomb, shape.bombTimer);
                }
            });
        });
    }
    requestAnimationFrame(render);
}

function renderDock() {
    state.dockShapes.forEach((shape, i) => {
        const dCanvas = document.getElementById(`p${i+1}`);
        const dCtx = dCanvas.getContext("2d");
        dCtx.clearRect(0, 0, 100, 100);
        if (shape) {
            const s = 20;
            shape.pattern.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) drawBlock(dCtx, x, y, s, shape.color, shape.isBomb, shape.bombTimer);
                });
            });
        }
    });
}

// --- 5. التحكم ---

function handleStart(e, index) {
    if (!state.dockShapes[index]) return;
    state.selectedDockIndex = index;
    state.isDragging = true;
    state.dragTime = Date.now();
}

function handleEnd(e) {
    if (!state.isDragging) return;
    
    // تدوير عند النقرة السريعة
    if (Date.now() - state.dragTime < 200) {
        state.dockShapes[state.selectedDockIndex].pattern = rotateMatrix(state.dockShapes[state.selectedDockIndex].pattern);
        renderDock();
    } else {
        const rect = canvas.getBoundingClientRect();
        const gx = Math.round((state.dragPos.x - rect.left) / cellSize - 1);
        const gy = Math.round((state.dragPos.y - rect.top) / cellSize - 1);
        
        const shape = state.dockShapes[state.selectedDockIndex];
        if (canPlace(shape.pattern, gx, gy)) {
            placeShape(shape, gx, gy);
            state.dockShapes[state.selectedDockIndex] = null;
            refreshDock();
            playSound(600, 'sine', 0.1);
        }
    }
    state.isDragging = false;
    state.selectedDockIndex = -1;
    renderDock();
}

// المستمعات
[1,2,3].forEach(i => {
    const el = document.getElementById(`p${i}`);
    el.addEventListener("pointerdown", (e) => handleStart(e, i-1));
});

window.addEventListener("pointermove", (e) => {
    state.dragPos = { x: e.clientX, y: e.clientY };
});

window.addEventListener("pointerup", handleEnd);

function startGame() {
    document.getElementById("overlay").style.display = "none";
    board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    state.score = 0;
    scoreText.innerText = "0";
    refreshDock();
    render();
}

function gameOver(msg) {
    alert(msg + "\nScore: " + state.score);
    location.reload();
                }
