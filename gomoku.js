// 基础常量
const SIZE = 15;           // 15x15
const MARGIN = 30;         // 棋盘边距
const CELL = 40;           // 网格间距
const BOARD_PIX = MARGIN * 2 + CELL * (SIZE - 1);
const EMPTY = 0, BLACK = 1, WHITE = 2;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const modeSel = document.getElementById('mode');
const aiBlackChk = document.getElementById('aiBlack');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const aiBlackWrap = document.getElementById('aiBlackWrap');

// --- 弹窗元素 ---
const winModal = document.getElementById('winModal');
const winTitle = document.getElementById('winTitle');
const closeModal = document.getElementById('closeModal');
const modalRestart = document.getElementById('modalRestart');

// 游戏状态
let board, currentPlayer, gameOver, lastMove;
let mode = modeSel.value;         // 'pve' or 'pvp'
let aiIsBlack = aiBlackChk.checked;

init();

function init() {
    // 画布尺寸固定 620x620
    canvas.width = BOARD_PIX;
    canvas.height = BOARD_PIX;

    // 事件绑定
    canvas.addEventListener('click', onCanvasClick);
    restartBtn.addEventListener('click', resetGame);
    modeSel.addEventListener('change', () => {
        mode = modeSel.value;
        aiBlackWrap.style.visibility = (mode === 'pve' ? 'visible' : 'hidden');
        resetGame();
    });
    aiBlackChk.addEventListener('change', () => {
        aiIsBlack = aiBlackChk.checked;
        resetGame();
    });

    // --- 弹窗事件 ---
    closeModal.onclick = () => { winModal.style.display = "none"; };
    modalRestart.onclick = () => {
        winModal.style.display = "none";
        resetGame();
    };
    window.onclick = (event) => {
        if (event.target == winModal) {
            winModal.style.display = "none";
        }
    };


    aiBlackWrap.style.visibility = (mode === 'pve' ? 'visible' : 'hidden');

    resetGame();
}

// 重置游戏
function resetGame() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
    currentPlayer = BLACK; // 黑先
    gameOver = false;
    lastMove = null;

    updateStatus();
    drawAll();

    // 如果是人机模式且AI执黑，则AI先手
    if (mode === 'pve' && aiIsBlack) {
        setTimeout(aiMove, 200);
    }
}

// 绘制棋盘和棋子
function drawAll() {
    // 背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f6e2b0';
    ctx.fillRect(0, 0, BOARD_PIX, BOARD_PIX);

    // 网格线（15条横线，15条竖线）
    ctx.strokeStyle = '#9f7a3f';
    ctx.lineWidth = 1;
    for (let i = 0; i < SIZE; i++) {
        // 横线
        const y = MARGIN + i * CELL;
        drawLine(MARGIN, y, MARGIN + CELL * (SIZE - 1), y);
        // 竖线
        const x = MARGIN + i * CELL;
        drawLine(x, MARGIN, x, MARGIN + CELL * (SIZE - 1));
    }

    // 星位/天元
    drawStar(3, 3);
    drawStar(3, 11);
    drawStar(7, 7);
    drawStar(11, 3);
    drawStar(11, 11);

    // 棋子
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (board[y][x] !== EMPTY) {
                drawStone(x, y, board[y][x]);
            }
        }
    }

    // 最后一手标记
    if (lastMove) {
        const { x, y } = lastMove;
        const px = MARGIN + x * CELL;
        const py = MARGIN + y * CELL;
        ctx.fillStyle = '#ff3b30';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
    ctx.lineTo(Math.round(x2) + 0.5, Math.round(y2) + 0.5);
    ctx.stroke();
}

function drawStar(gx, gy) {
    const r = 4;
    const x = MARGIN + gx * CELL;
    const y = MARGIN + gy * CELL;
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawStone(gx, gy, color) {
    const x = MARGIN + gx * CELL;
    const y = MARGIN + gy * CELL;
    const r = 15;

    // 阴影和高光，让棋子更好看
    const gradient = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, r);
    if (color === BLACK) {
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#dcdcdc');
    }
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // 外轮廓
    ctx.strokeStyle = color === BLACK ? '#000' : '#aaa';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// 点击事件
function onCanvasClick(e) {
    if (gameOver) return;

    // 人机对战时，如果当前是AI回合则忽略点击
    if (mode === 'pve' && ((aiIsBlack && currentPlayer === BLACK) || (!aiIsBlack && currentPlayer === WHITE))) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // 吸附到最近交叉点
    const gx = Math.round((mx - MARGIN) / CELL);
    const gy = Math.round((my - MARGIN) / CELL);

    if (gx < 0 || gx >= SIZE || gy < 0 || gy >= SIZE) return;

    if (board[gy][gx] !== EMPTY) return;

    placeStone(gx, gy, currentPlayer);

    if (gameOver) return;

    if (mode === 'pve') {
        setTimeout(aiMove, 200);
    }
}

// 落子
function placeStone(x, y, player) {
    if (board[y][x] !== EMPTY) return false;
    board[y][x] = player;
    lastMove = { x, y };

    drawAll(); // 先绘制棋子

    const result = checkWin(x, y, player);
    if (result === player) {
        gameOver = true;
        const winnerText = `${player === BLACK ? '黑' : '白'}方胜！`;
        updateStatus(winnerText);
        setTimeout(() => showWinModal(winnerText), 300); // 稍作延迟后弹窗
    } else if (result === -1) {
        gameOver = true;
        updateStatus('平局！棋盘已满');
        setTimeout(() => showWinModal('平局！'), 300);
    } else {
        // 继续游戏，切换手
        currentPlayer = (currentPlayer === BLACK) ? WHITE : BLACK;
        updateStatus();
    }

    return true;
}

// 胜负判断，返回：player（胜），-1（平），0（未结束）
function checkWin(x, y, player) {
    const dirs = [
        [1, 0],  // 横
        [0, 1],  // 竖
        [1, 1],  // 撇
        [1, -1], // 捺
    ];

    for (const [dx, dy] of dirs) {
        let count = 1;

        // 正向
        let i = 1;
        while (inBoard(x + i * dx, y + i * dy) && board[y + i * dy][x + i * dx] === player) {
            count++; i++;
        }
        // 反向
        i = 1;
        while (inBoard(x - i * dx, y - i * dy) && board[y - i * dy][x - i * dx] === player) {
            count++; i++;
        }
        if (count >= 5) return player;
    }

    // 平局：无空位
    const hasEmpty = board.some(row => row.some(cell => cell === EMPTY));
    return hasEmpty ? 0 : -1;
}

function inBoard(x, y) {
    return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

function updateStatus(text) {
    if (text) {
        statusEl.textContent = text;
        return;
    }
    if (gameOver) return;
    const cur = currentPlayer === BLACK ? '黑' : '白';
    if (mode === 'pvp') {
        statusEl.textContent = `当前回合：${cur}`;
    } else {
        const who = ((aiIsBlack && currentPlayer === BLACK) || (!aiIsBlack && currentPlayer === WHITE)) ? 'AI' : '玩家';
        statusEl.textContent = `当前回合：${cur}（${who}）`;
    }
}

// --- 新增：显示弹窗 ---
function showWinModal(text) {
    winTitle.textContent = text;
    winModal.style.display = "block";
}

// AI 回合
function aiMove() {
    if (gameOver) return;

    const aiPlayer = aiIsBlack ? BLACK : WHITE;
    const human = aiPlayer === BLACK ? WHITE : BLACK;

    // 1) 能赢就下
    const winMove = findWinningMove(aiPlayer);
    if (winMove) {
        placeStone(winMove.x, winMove.y, aiPlayer);
        return;
    }

    // 2) 挡对方必胜
    const blockMove = findWinningMove(human);
    if (blockMove) {
        placeStone(blockMove.x, blockMove.y, aiPlayer);
        return;
    }

    // 3) 启发式评估，选择最优点
    const { x, y } = bestHeuristicMove(aiPlayer, human);
    placeStone(x, y, aiPlayer);
}

// 查找一步取胜点
function findWinningMove(player) {
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (board[y][x] !== EMPTY) continue;
            // 模拟
            board[y][x] = player;
            const win = (checkWin(x, y, player) === player);
            board[y][x] = EMPTY;
            if (win) return { x, y };
        }
    }
    return null;
}

// 评估函数：返回当前最优落点（考虑进攻与防守）
function bestHeuristicMove(aiPlayer, opponent) {
    let best = { x: -1, y: -1, score: -Infinity };

    // 如果棋盘为空，首步优先中心
    if (isBoardEmpty()) {
        const cx = Math.floor(SIZE / 2);
        const cy = Math.floor(SIZE / 2);
        return { x: cx, y: cy };
    }

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (board[y][x] !== EMPTY) continue;

            const attack = evaluatePoint(x, y, aiPlayer);
            const defend = evaluatePoint(x, y, opponent) * 0.92; // 适度重视防守
            const centerBias = centerWeight(x, y);

            const score = Math.max(attack, defend) + centerBias;

            if (score > best.score) {
                best = { x, y, score };
            }
        }
    }
    return best;
}

function isBoardEmpty() {
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (board[y][x] !== EMPTY) return false;
        }
    }
    return true;
}

// 计算居中偏好（距离中心越近加分越多）
function centerWeight(x, y) {
    const cx = (SIZE - 1) / 2;
    const cy = (SIZE - 1) / 2;
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    const dist = Math.sqrt(dx * dx + dy * dy);
    // 最大约 ~9.9，这里让中心加 30 分，边缘 ~5 分
    return 35 - dist * 3;
}

// 对一个点（假设在此落子）进行模式评分
function evaluatePoint(x, y, player) {
    const dirs = [
        [1, 0],  // 横
        [0, 1],  // 竖
        [1, 1],  // 撇
        [1, -1], // 捺
    ];

    let total = 0;

    for (const [dx, dy] of dirs) {
        let count = 1;   // 包含自身
        let open1 = 0, open2 = 0;

        // 正向
        let i = 1;
        while (inBoard(x + i * dx, y + i * dy) && board[y + i * dy][x + i * dx] === player) {
            count++; i++;
        }
        if (inBoard(x + i * dx, y + i * dy) && board[y + i * dy][x + i * dx] === EMPTY) open1 = 1;

        // 反向
        i = 1;
        while (inBoard(x - i * dx, y - i * dy) && board[y - i * dy][x - i * dx] === player) {
            count++; i++;
        }
        if (inBoard(x - i * dx, y - i * dy) && board[y - i * dy][x - i * dx] === EMPTY) open2 = 1;

        const openEnds = open1 + open2;
        total += patternScore(count, openEnds);
    }

    return total;
}

// 模式分数（越高越优）
function patternScore(count, openEnds) {
    // count：含自身的连续个数；openEnds：两端是否有空（0/1/2）
    if (count >= 5) return 1000000; // 成五
    if (count === 4 && openEnds === 2) return 100000; // 活四
    if (count === 4 && openEnds === 1) return 10000;  // 冲四
    if (count === 3 && openEnds === 2) return 2500;   // 活三
    if (count === 3 && openEnds === 1) return 400;    // 眠三
    if (count === 2 && openEnds === 2) return 200;    // 活二
    if (count === 2 && openEnds === 1) return 50;     // 眠二
    if (count === 1 && openEnds === 2) return 10;     // 单点两头空
    return 2; // 其他
}