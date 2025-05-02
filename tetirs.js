const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');

// Configurações do jogo
const grid = 20; // peças menores
const cols = 40; // 40 colunas
const rows = canvas.height / grid;

// Formatos das peças
const shapes = [
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]],       // O
    [[1, 1, 1, 1]],         // I
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]]  // J
];

let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let currentPiece = createPiece();
let dropCounter = 0;
let dropInterval = 60; // 50% mais rápido
let lastTime = 0;

// Cria uma nova peça aleatória em posição horizontal aleatória
function createPiece() {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const maxX = cols - shape[0].length;
    return {
        shape,
        x: Math.floor(Math.random() * (maxX + 1)),
        y: 0
    };
}

// Desenha o tabuleiro
function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                context.fillStyle = 'blue';
                context.fillRect(x * grid, y * grid, grid - 1, grid - 1);
            }
        });
    });
}

// Desenha a peça atual
function drawPiece(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                context.fillStyle = 'red';
                context.fillRect((piece.x + x) * grid, (piece.y + y) * grid, grid - 1, grid - 1);
            }
        });
    });
}

// Verifica colisões
function collides(piece = currentPiece) {
    return piece.shape.some((row, y) =>
        row.some((cell, x) => {
            if (!cell) return false;
            const px = piece.x + x;
            const py = piece.y + y;
            return (
                px < 0 ||
                px >= cols ||
                py >= rows ||
                (py >= 0 && board[py][px])
            );
        })
    );
}

// Mescla a peça ao tabuleiro
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const px = currentPiece.x + x;
                const py = currentPiece.y + y;
                if (py >= 0) board[py][px] = cell;
            }
        });
    });
}

// Limpa linhas completas
function clearLines() {
    for (let y = board.length - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
            y++;
        }
    }
}

// Move a peça
function movePiece(dx, dy) {
    const moved = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy, shape: currentPiece.shape };
    if (!collides(moved)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

// Rotaciona a peça
function rotatePiece() {
    const shape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i])).reverse();
    const rotated = { ...currentPiece, shape };
    if (!collides(rotated)) {
        currentPiece.shape = shape;
    }
}

// Atualiza o estado do jogo
function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;
    if (dropCounter > dropInterval) {
        dropCounter = 0;
        if (!movePiece(0, 1)) {
            mergePiece();
            clearLines();
            currentPiece = createPiece();
            if (collides()) {
                board = Array.from({ length: rows }, () => Array(cols).fill(0));
                currentPiece = createPiece();
            }
        }
    }
    drawBoard();
    drawPiece(currentPiece);
    requestAnimationFrame(update);
}

// Controles do teclado
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') movePiece(-1, 0);
    else if (e.key === 'ArrowRight') movePiece(1, 0);
    else if (e.key === 'ArrowDown') movePiece(0, 1);
    else if (e.key === 'ArrowUp') rotatePiece();
});

// Inicializa o jogo
update();
