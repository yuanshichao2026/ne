const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextContext = nextCanvas.getContext('2d');

const GRID_SIZE = 20; // 每个方块的大小（像素）
const GRID_WIDTH = canvas.width / GRID_SIZE; // 游戏区域的列数
const GRID_HEIGHT = canvas.height / GRID_SIZE; // 游戏区域的行数

const TETROMINOES = [
    // I-方块
    [[0, 0, 0, 0],
     [1, 1, 1, 1],
     [0, 0, 0, 0],
     [0, 0, 0, 0]],
    // J-方块
    [[1, 0, 0],
     [1, 1, 1],
     [0, 0, 0]],
    // L-方块
    [[0, 0, 1],
     [1, 1, 1],
     [0, 0, 0]],
    // O-方块
    [[1, 1],
     [1, 1]],
    // S-方块
    [[0, 1, 1],
     [1, 1, 0],
     [0, 0, 0]],
    // T-方块
    [[0, 1, 0],
     [1, 1, 1],
     [0, 0, 0]],
    // Z-方块
    [[1, 1, 0],
     [0, 1, 1],
     [0, 0, 0]]
];

const COLORS = [
    '#00FFFF', // I-方块 (青色)
    '#0000FF', // J-方块 (蓝色)
    '#FFA500', // L-方块 (橙色)
    '#FFFF00', // O-方块 (黄色)
    '#00FF00', // S-方块 (绿色)
    '#800080', // T-方块 (紫色)
    '#FF0000'  // Z-方块 (红色)
];

let board = [];
let currentTetromino;
let currentTetrominoColor;
let currentTetrominoX;
let currentTetrominoY;
let nextTetromino;
let nextTetrominoColor;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let gamePaused = false;
let gameStarted = false;
let dropInterval = 1000; // 初始下落速度

// 初始化游戏板
function initBoard() {
    for (let r = 0; r < GRID_HEIGHT; r++) {
        board[r] = [];
        for (let c = 0; c < GRID_WIDTH; c++) {
            board[r][c] = 0; // 0 表示空方块
        }
    }
}

// 绘制单个方块
function drawSquare(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

// 绘制当前方块
function draw() {
    // 清除主画布
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制游戏板上已固定的方块
    for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
            if (board[r][c] !== 0) {
                drawSquare(context, c, r, board[r][c]);
            }
        }
    }

    // 绘制当前下落的方块
    if (currentTetromino) {
        for (let r = 0; r < currentTetromino.length; r++) {
            for (let c = 0; c < currentTetromino[r].length; c++) {
                if (currentTetromino[r][c] === 1) {
                    drawSquare(context, currentTetrominoX + c, currentTetrominoY + r, currentTetrominoColor);
                }
            }
        }
    }

    // 绘制下一个方块预览
    drawNextTetromino();

    // 更新得分显示
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 绘制下一个方块预览
function drawNextTetromino() {
    // 清除预览画布
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextTetromino) {
        const offsetX = (nextCanvas.width / GRID_SIZE - nextTetromino[0].length) / 2;
        const offsetY = (nextCanvas.height / GRID_SIZE - nextTetromino.length) / 2;

        for (let r = 0; r < nextTetromino.length; r++) {
            for (let c = 0; c < nextTetromino[r].length; c++) {
                if (nextTetromino[r][c] === 1) {
                    drawSquare(nextContext, offsetX + c, offsetY + r, nextTetrominoColor);
                }
            }
        }
    }
}

// 生成新的俄罗斯方块
function generateTetromino() {
    if (nextTetromino) {
        currentTetromino = nextTetromino;
        currentTetrominoColor = nextTetrominoColor;
    } else {
        const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
        currentTetromino = TETROMINOES[randomIndex];
        currentTetrominoColor = COLORS[randomIndex];
    }

    // 生成下一个方块
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    nextTetromino = TETROMINOES[randomIndex];
    nextTetrominoColor = COLORS[randomIndex];

    currentTetrominoX = Math.floor(GRID_WIDTH / 2) - Math.floor(currentTetromino[0].length / 2);
    currentTetrominoY = 0;

    // 检查游戏是否结束
    if (!isValidMove(currentTetrominoX, currentTetrominoY, currentTetromino)) {
        gameOver = true;
        alert('游戏结束！最终得分：' + score);
        document.getElementById('startBtn').textContent = '开始游戏';
        gameStarted = false;
    }
}

// 检查方块移动或旋转是否有效
function isValidMove(x, y, tetromino) {
    for (let r = 0; r < tetromino.length; r++) {
        for (let c = 0; c < tetromino[r].length; c++) {
            if (tetromino[r][c] === 1) {
                const newX = x + c;
                const newY = y + r;

                // 检查是否超出边界
                if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
                    return false;
                }
                // 检查是否与已固定的方块重叠
                if (newY < 0) continue; // 允许方块在顶部生成时超出边界
                if (board[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 游戏主循环
let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
    if (gameOver || !gameStarted || gamePaused) {
        lastTime = time;
        requestAnimationFrame(update);
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        dropTetromino();
    }

    draw();
    requestAnimationFrame(update);
}

// 方块下落
function dropTetromino() {
    if (isValidMove(currentTetrominoX, currentTetrominoY + 1, currentTetromino)) {
        currentTetrominoY++;
    } else {
        mergeTetromino();
        const clearedLines = clearLines();
        updateScore(clearedLines);
        generateTetromino();
    }
    dropCounter = 0;
}

// 将当前方块合并到游戏板上
function mergeTetromino() {
    for (let r = 0; r < currentTetromino.length; r++) {
        for (let c = 0; c < currentTetromino[r].length; c++) {
            if (currentTetromino[r][c] === 1) {
                board[currentTetrominoY + r][currentTetrominoX + c] = currentTetrominoColor;
            }
        }
    }
}

// 清除已满的行
function clearLines() {
    let linesCleared = 0;
    
    outer: for (let r = GRID_HEIGHT - 1; r >= 0; r--) {
        for (let c = 0; c < GRID_WIDTH; c++) {
            if (board[r][c] === 0) {
                continue outer;
            }
        }

        // 如果一行已满，则清除该行并将上面的行下移
        const row = board.splice(r, 1)[0].fill(0);
        board.unshift(row);
        r++; // 重新检查当前行，因为上面的行已经下移
        linesCleared++;
    }
    
    return linesCleared;
}

// 更新得分
function updateScore(linesCleared) {
    if (linesCleared === 0) return;
    
    // 根据消除的行数计算得分
    const linePoints = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4行的得分
    score += linePoints[linesCleared] * level;
    
    // 更新已消除的行数
    lines += linesCleared;
    
    // 每消除10行升一级
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel > level) {
        level = newLevel;
        // 随着等级提高，方块下落速度加快
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    }
}

// 旋转方块
function rotateTetromino() {
    const originalTetromino = currentTetromino;
    const rotatedTetromino = [];
    for (let r = 0; r < originalTetromino.length; r++) {
        rotatedTetromino[r] = [];
        for (let c = 0; c < originalTetromino.length; c++) {
            rotatedTetromino[r][c] = originalTetromino[originalTetromino.length - 1 - c][r];
        }
    }

    if (isValidMove(currentTetrominoX, currentTetrominoY, rotatedTetromino)) {
        currentTetromino = rotatedTetromino;
    }
}

// 硬降（直接下落到底部）
function hardDrop() {
    while (isValidMove(currentTetrominoX, currentTetrominoY + 1, currentTetromino)) {
        currentTetrominoY++;
    }
    dropTetromino();
}

// 键盘事件监听
document.addEventListener('keydown', event => {
    if (!gameStarted || gameOver || gamePaused) return;

    if (event.key === 'ArrowLeft') {
        if (isValidMove(currentTetrominoX - 1, currentTetrominoY, currentTetromino)) {
            currentTetrominoX--;
        }
    } else if (event.key === 'ArrowRight') {
        if (isValidMove(currentTetrominoX + 1, currentTetrominoY, currentTetromino)) {
            currentTetrominoX++;
        }
    } else if (event.key === 'ArrowDown') {
        dropTetromino();
    } else if (event.key === 'ArrowUp') {
        rotateTetromino();
    } else if (event.key === ' ') { // 空格键硬降
        hardDrop();
    }
    draw();
});

// 按钮事件监听
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        if (gameOver) {
            // 重置游戏
            resetGame();
        }
        gameStarted = true;
        gamePaused = false;
        document.getElementById('startBtn').textContent = '重新开始';
        document.getElementById('pauseBtn').disabled = false;
    } else {
        // 重置游戏
        resetGame();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    if (!gameStarted || gameOver) return;
    
    gamePaused = !gamePaused;
    document.getElementById('pauseBtn').textContent = gamePaused ? '继续' : '暂停';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    resetGame();
});

// 重置游戏
function resetGame() {
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    gameOver = false;
    gamePaused = false;
    gameStarted = true;
    
    document.getElementById('startBtn').textContent = '重新开始';
    document.getElementById('pauseBtn').textContent = '暂停';
    document.getElementById('pauseBtn').disabled = false;
    
    initBoard();
    nextTetromino = null;
    generateTetromino();
}

// 初始化游戏
initBoard();
generateTetromino();
update();

// 初始状态下禁用暂停按钮
document.getElementById('pauseBtn').disabled = true;

// 页面加载完成后自动开始游戏
window.addEventListener('load', () => {
    // 延迟一点时间确保所有元素都已加载
    setTimeout(() => {
        resetGame();
    }, 100);
});