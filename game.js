// Block SAm - Game Engine
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const feverBar = document.getElementById("fever-bar");

const GRID_SIZE = 8;
let cellSize;
let board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));

// حالة اللعبة
let state = {
    score: 0,
    highScore: localStorage.getItem("bsHigh") || 0,
    feverEnergy: 0,
    isFever: false,
    bombs: [] // لتخزين أماكن القنابل وعداداتها
};

// إعدادات الأيقونات (من صورتك plast.png)
const sprite = new Image();
sprite.src = 'plast.png';

// دالة تدوير القطعة (بالنقر)
function rotateMatrix(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

// رسم البلوك باحترافية (3D + Icon + Bomb)
function drawBlock(c, x, y, size, color, isBomb, bombTimer, isGhost = false) {
    c.save();
    c.globalAlpha = isGhost ? 0.3 : 1;
    
    // الجسم 3D
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(x * size + 2, y * size + 2, size - 4, size - 4, 8);
    c.fill();

    // لو قنبلة، نرسم عداد
    if (isBomb) {
        c.fillStyle = "white";
        c.font = `bold ${size/2}px Arial`;
        c.textAlign = "center";
        c.fillText(bombTimer, x * size + size/2, y * size + size/1.5);
        // إضافة توهج أحمر للقنبلة
        c.shadowBlur = 10;
        c.shadowColor = "red";
    }

    c.restore();
}

// تحديث الـ Fever
function updateFever(amount) {
    state.feverEnergy = Math.min(100, state.feverEnergy + amount);
    feverBar.style.width = state.feverEnergy + "%";
    
    if (state.feverEnergy >= 100 && !state.isFever) {
        activateFever();
    }
}

function activateFever() {
    state.isFever = true;
    canvas.style.boxShadow = "0 0 30px #f43f5e";
    setTimeout(() => {
        state.isFever = false;
        state.feverEnergy = 0;
        feverBar.style.width = "0%";
        canvas.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    }, 10000); // 10 ثواني حماس
}

// باقي ميكانيكا اللعبة (السحب والمسح) يتم دمجها هنا...
