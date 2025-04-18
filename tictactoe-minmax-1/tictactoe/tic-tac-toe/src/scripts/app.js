const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart-btn'); // Changed from restart-button
const statusDiv = document.querySelector('.status'); // Changed from getElementById('status')

let board = Array(9).fill(null);
let currentPlayer = 'X'; // Player is 'X', AI is 'O'
let gameActive = true;
let scores = { player: 0, ai: 0, draws: 0 };

// Event listeners for cells
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});

// Restart button
document.getElementById('restart-btn').addEventListener('click', restartGame);
document.getElementById('play-again-btn').addEventListener('click', restartGame);

function handleCellClick(index) {
    if (!gameActive || board[index] || checkWinner(board)) return;

    // Update turn indicator
    updateTurnIndicator(false);

    // Player's move
    board[index] = currentPlayer;
    cells[index].innerHTML = currentPlayer;
    cells[index].classList.add('placed-x');
    cells[index].setAttribute('data-player', 'X');
    
    renderBoard();

    const winner = checkWinner(board);
    if (winner) {
        handleGameEnd(winner);
        return;
    }

    if (board.every(cell => cell)) {
        handleDraw();
        return;
    }

    // AI's move - add slight delay to simulate "thinking"
    setTimeout(() => {
        currentPlayer = 'O';
        const bestMove = findBestMove(board);
        board[bestMove] = currentPlayer;
        cells[bestMove].innerHTML = currentPlayer;
        cells[bestMove].classList.add('placed-o');
        cells[bestMove].setAttribute('data-player', 'O');
        
        renderBoard();

        const aiWinner = checkWinner(board);
        if (aiWinner) {
            handleGameEnd(aiWinner);
            return;
        }

        if (board.every(cell => cell)) {
            handleDraw();
            return;
        }

        currentPlayer = 'X';
        updateTurnIndicator(true);
    }, 500);
}

function renderBoard() {
    cells.forEach((cell, index) => {
        if (board[index] === 'X') {
            cell.innerHTML = 'X';
            cell.setAttribute('data-player', 'X');
        } else if (board[index] === 'O') {
            cell.innerHTML = 'O';
            cell.setAttribute('data-player', 'O');
        } else {
            cell.innerHTML = '';
            cell.removeAttribute('data-player');
        }
    });
}

function handleGameEnd(winner) {
    gameActive = false;
    
    // Highlight winning combination
    const winningCombination = getWinningCombination();
    if (winningCombination) {
        winningCombination.forEach(index => {
            cells[index].classList.add('winning');
        });
    }
    
    // Update score
    if (winner === 'X') {
        scores.player++;
        updateStatus('You win!', 'win');
        setTimeout(() => showGameResult('win'), 1000);
    } else {
        scores.ai++;
        updateStatus('AI wins!', 'lose');
        setTimeout(() => showGameResult('lose'), 1000);
    }
    
    updateScore(scores.player, scores.draws, scores.ai);
}

function handleDraw() {
    gameActive = false;
    scores.draws++;
    updateStatus('It\'s a draw!', 'draw');
    updateScore(scores.player, scores.draws, scores.ai);
    setTimeout(() => showGameResult('draw'), 1000);
}

function restartGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    
    // Clear game board
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.removeAttribute('data-player');
        cell.classList.remove('placed-x', 'placed-o', 'winning');
    });
    
    // Reset UI elements
    updateStatus('Game in progress...', '');
    updateTurnIndicator(true);
    
    // Close modal if open
    const modal = document.querySelector('.result-modal');
    const overlay = document.querySelector('.overlay');
    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// UI update functions
function updateTurnIndicator(isPlayerTurn) {
    const indicators = document.querySelectorAll('.player-indicator');
    if (indicators && indicators.length >= 2) {
        indicators[0].classList.toggle('active', isPlayerTurn);
        indicators[1].classList.toggle('active', !isPlayerTurn);
    }
}

function updateStatus(message, type) {
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = 'status';
        if (type) {
            statusDiv.classList.add(type);
        }
    }
}

function updateScore(player, draws, ai) {
    const playerScore = document.getElementById('player-score');
    const drawScore = document.getElementById('draw-score');
    const aiScore = document.getElementById('ai-score');
    
    if (playerScore) playerScore.textContent = player;
    if (drawScore) drawScore.textContent = draws;
    if (aiScore) aiScore.textContent = ai;
}

function showGameResult(result) {
    const modal = document.querySelector('.result-modal');
    const overlay = document.querySelector('.overlay');
    const resultMessage = document.getElementById('result-message');
    const emoji = document.querySelector('.emoji');
    
    if (modal && overlay && resultMessage && emoji) {
        // Update content based on result
        if (result === 'win') {
            resultMessage.textContent = 'You won the game!';
            emoji.textContent = '🎉';
        } else if (result === 'lose') {
            resultMessage.textContent = 'The AI has won this round.';
            emoji.textContent = '🤖';
        } else {
            resultMessage.textContent = "It's a draw!";
            emoji.textContent = '🤝';
        }
        
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

// Get the specific winning combination that won the game
function getWinningCombination() {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return combination;
        }
    }
    return null;
}

// Minimax Algorithm
function findBestMove(board) {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            board[i] = 'O'; // AI's move
            let score = minimax(board, 0, false);
            board[i] = null; // Undo move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);
    if (winner === 'X') return -10 + depth;
    if (winner === 'O') return 10 - depth;
    if (board.every(cell => cell)) return 0; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check for a winner
function checkWinner(board) {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// Initialize game
updateTurnIndicator(true);
updateStatus('Game in progress...', '');