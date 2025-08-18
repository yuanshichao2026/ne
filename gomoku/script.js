const board = document.getElementById('board');
const resetButton = document.getElementById('reset');
const size = 15;
let currentPlayer = 'black';
let boardState = Array(size).fill(null).map(() => Array(size).fill(null));

function createBoard() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleClick);
            board.appendChild(cell);
        }
    }
}

function handleClick(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    if (boardState[row][col]) {
        return;
    }

    boardState[row][col] = currentPlayer;
    const piece = document.createElement('div');
    piece.classList.add('piece', currentPlayer);
    event.target.appendChild(piece);

    if (checkWin(parseInt(row), parseInt(col))) {
        setTimeout(() => {
            alert(`${currentPlayer.toUpperCase()} wins!`);
            resetBoard();
        }, 100);
        return;
    }

    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
}

function checkWin(row, col) {
    const directions = [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }, // Vertical
        { x: 1, y: 1 }, // Diagonal \
        { x: 1, y: -1 } // Diagonal /
    ];

    for (const dir of directions) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
            const newRow = row + dir.y * i;
            const newCol = col + dir.x * i;
            if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && boardState[newRow][newCol] === currentPlayer) {
                count++;
            } else {
                break;
            }
        }
        for (let i = 1; i < 5; i++) {
            const newRow = row - dir.y * i;
            const newCol = col - dir.x * i;
            if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && boardState[newRow][newCol] === currentPlayer) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
    }
    return false;
}

function resetBoard() {
    board.innerHTML = '';
    boardState = Array(size).fill(null).map(() => Array(size).fill(null));
    currentPlayer = 'black';
    createBoard();
}

createBoard();
resetButton.addEventListener('click', resetBoard);
