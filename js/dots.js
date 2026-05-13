/* Dots and Boxes - Kindle Optimized (ES5 Only) */
var boardSize = 5; // dots: 5x5, squares: 4x4
var horizontalLines = [];
var verticalLines = [];
var squares = [];
var currentPlayer = 1;
var scores = [0, 0, 0, 0, 0]; // Index 1 to 4
var numPlayers = 2;
var isAI = false;
var aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
var gameOver = false;

var setupScreen = document.getElementById('setup-screen');
var gameScreen = document.getElementById('game-screen');
var scoreBoard = document.getElementById('score-board');
var statusMsg = document.getElementById('status-msg');
var boardEl = document.getElementById('board');
var pCountSel = document.getElementById('player-count-selection');

function init() {
    document.getElementById('btn-pve').onclick = function() {
        isAI = true;
        pCountSel.style.display = 'none';
        document.getElementById('btn-start-pve').style.display = 'none';
        document.getElementById('difficulty-selector').style.display = 'block';
        document.getElementById('diff-desc-text').innerText = '';
    };
    document.getElementById('btn-pvp').onclick = function() {
        isAI = false;
        document.getElementById('btn-start-pve').style.display = 'none';
        document.getElementById('difficulty-selector').style.display = 'none';
        document.getElementById('diff-desc-text').innerText = '';
        pCountSel.style.display = 'block';
    };
}

function setDifficulty(diff) {
    aiDifficulty = diff;
    // Highlight selected button
    var ids = ['btn-dots-easy', 'btn-dots-med', 'btn-dots-hard'];
    var diffs = ['easy', 'medium', 'hard'];
    for (var i = 0; i < ids.length; i++) {
        var btn = document.getElementById(ids[i]);
        btn.style.background = (diffs[i] === diff) ? 'black' : 'white';
        btn.style.color = (diffs[i] === diff) ? 'white' : 'black';
    }
    // Show description
    var descKey = (diff === 'easy') ? 'diff_easy_desc' : (diff === 'hard') ? 'diff_hard_desc' : 'diff_med_desc';
    var descEl = document.getElementById('diff-desc-text');
    descEl.innerText = (typeof getTranslation !== 'undefined') ? getTranslation(descKey) : diff;
    // Show start button
    document.getElementById('btn-start-pve').style.display = 'inline-block';
}

function startGame(players) {
    numPlayers = players;
    setupScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resetGame();
}

function backToMenu() {
    gameScreen.style.display = 'none';
    setupScreen.style.display = 'block';
    pCountSel.style.display = 'none';
    document.getElementById('btn-start-pve').style.display = 'none';
}

function resetGame() {
    currentPlayer = 1;
    scores = [0, 0, 0, 0, 0];
    gameOver = false;
    horizontalLines = [];
    verticalLines = [];
    squares = [];

    for (var i = 0; i < boardSize; i++) {
        horizontalLines[i] = [];
        for (var j = 0; j < boardSize - 1; j++) {
            horizontalLines[i][j] = 0;
        }
    }
    for (var i = 0; i < boardSize - 1; i++) {
        verticalLines[i] = [];
        for (var j = 0; j < boardSize; j++) {
            verticalLines[i][j] = 0;
        }
    }
    for (var i = 0; i < boardSize - 1; i++) {
        squares[i] = [];
        for (var j = 0; j < boardSize - 1; j++) {
            squares[i][j] = 0;
        }
    }

    renderBoard();
    updateUI();
}

function renderBoard() {
    boardEl.innerHTML = '';
    var dotSpacing = 56; // px between dots
    var dotSize = 10;
    var lineThick = 12;
    var boardPx = (boardSize - 1) * dotSpacing + dotSize;

    // Explicitly set height so the relatively-positioned container does NOT collapse
    boardEl.style.width = boardPx + 'px';
    boardEl.style.height = boardPx + 'px';

    // 1. Squares (bottom layer)
    for (var r = 0; r < boardSize - 1; r++) {
        for (var c = 0; c < boardSize - 1; c++) {
            var sq = document.createElement('div');
            sq.className = 'square-box';
            if (squares[r][c] > 0) {
                sq.className += ' square-p' + squares[r][c];
                var inner = document.createElement('div');
                inner.className = 'square-content';
                inner.innerText = 'P' + squares[r][c];
                sq.appendChild(inner);
            } else {
                // Invisible spacer to prevent collapse
                var spc = document.createElement('span');
                spc.style.visibility = 'hidden';
                spc.innerText = '0';
                sq.appendChild(spc);
            }
            sq.style.left = (c * dotSpacing + dotSize) + 'px';
            sq.style.top = (r * dotSpacing + dotSize) + 'px';
            sq.style.width = (dotSpacing - dotSize) + 'px';
            sq.style.height = (dotSpacing - dotSize) + 'px';
            boardEl.appendChild(sq);
        }
    }

    // 2. Horizontal Lines
    for (var r = 0; r < boardSize; r++) {
        for (var c = 0; c < boardSize - 1; c++) {
            (function(rr, cc) {
                var line = document.createElement('div');
                var placed = horizontalLines[rr][cc];
                line.className = 'line line-h' + (placed ? ' placed' : '');
                line.style.left = (cc * dotSpacing + dotSize) + 'px';
                line.style.top = (rr * dotSpacing + Math.floor((dotSize - lineThick) / 2)) + 'px';
                line.style.width = (dotSpacing - dotSize) + 'px';
                line.style.height = lineThick + 'px';
                if (!placed && !gameOver) {
                    line.onclick = (function(r2, c2) {
                        return function() { makeMove('h', r2, c2); };
                    })(rr, cc);
                }
                boardEl.appendChild(line);
            })(r, c);
        }
    }

    // 3. Vertical Lines
    for (var r = 0; r < boardSize - 1; r++) {
        for (var c = 0; c < boardSize; c++) {
            (function(rr, cc) {
                var line = document.createElement('div');
                var placed = verticalLines[rr][cc];
                line.className = 'line line-v' + (placed ? ' placed' : '');
                line.style.top = (rr * dotSpacing + dotSize) + 'px';
                line.style.left = (cc * dotSpacing + Math.floor((dotSize - lineThick) / 2)) + 'px';
                line.style.height = (dotSpacing - dotSize) + 'px';
                line.style.width = lineThick + 'px';
                if (!placed && !gameOver) {
                    line.onclick = (function(r2, c2) {
                        return function() { makeMove('v', r2, c2); };
                    })(rr, cc);
                }
                boardEl.appendChild(line);
            })(r, c);
        }
    }

    // 4. Dots (top layer)
    for (var r = 0; r < boardSize; r++) {
        for (var c = 0; c < boardSize; c++) {
            var dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = (c * dotSpacing) + 'px';
            dot.style.top = (r * dotSpacing) + 'px';
            dot.style.width = dotSize + 'px';
            dot.style.height = dotSize + 'px';
            boardEl.appendChild(dot);
        }
    }
}

function makeMove(type, r, c) {
    if (gameOver) return;

    var completedSquare = false;
    if (type === 'h') {
        horizontalLines[r][c] = currentPlayer;
        if (r > 0 && checkSquare(r - 1, c)) completedSquare = true;
        if (r < boardSize - 1 && checkSquare(r, c)) completedSquare = true;
    } else {
        verticalLines[r][c] = currentPlayer;
        if (c > 0 && checkSquare(r, c - 1)) completedSquare = true;
        if (c < boardSize - 1 && checkSquare(r, c)) completedSquare = true;
    }

    // Re-render to show the newly drawn line
    renderBoard();

    if (checkGameOver()) return;

    if (!completedSquare) {
        // Next player's turn
        currentPlayer = (currentPlayer % numPlayers) + 1;
    }
    updateUI();

    if (isAI && currentPlayer === 2 && !gameOver) {
        setTimeout(aiMove, 700);
    }
}

function checkSquare(r, c) {
    if (squares[r][c] !== 0) return false;
    if (horizontalLines[r][c] && horizontalLines[r + 1][c] &&
        verticalLines[r][c] && verticalLines[r][c + 1]) {
        squares[r][c] = currentPlayer;
        scores[currentPlayer]++;
        return true;
    }
    return false;
}

function updateUI() {
    var html = '';
    for (var i = 1; i <= numPlayers; i++) {
        var label;
        if (isAI && i === 2) {
            label = (typeof getTranslation !== 'undefined') ? getTranslation('score_ai') : 'AI: ';
        } else {
            // Reuse generic "P1: ", "P2: " labels
            label = 'P' + i + ': ';
        }
        var active = (currentPlayer === i) ? ' player-active' : '';
        html += '<div class="player-score' + active + '">' + label + scores[i] + '</div>';
    }
    scoreBoard.innerHTML = html;

    if (statusMsg) {
        var txt = '';
        if (isAI && currentPlayer === 2) {
            txt = (typeof getTranslation !== 'undefined') ? getTranslation('turn_ai') : 'IA pensando...';
        } else {
            // turn_p1, turn_p2, turn_p3, turn_p4
            var key = 'turn_p' + currentPlayer;
            txt = (typeof getTranslation !== 'undefined') ? getTranslation(key) : ('Turn P' + currentPlayer);
        }
        statusMsg.innerText = txt;
    }
}

function checkGameOver() {
    var total = (boardSize - 1) * (boardSize - 1);
    var filled = 0;
    for (var i = 1; i <= numPlayers; i++) filled += scores[i];
    if (filled < total) return false;

    gameOver = true;

    // Find winner
    var winner = 1;
    var maxScore = scores[1];
    var tie = false;
    for (var j = 2; j <= numPlayers; j++) {
        if (scores[j] > maxScore) {
            maxScore = scores[j];
            winner = j;
            tie = false;
        } else if (scores[j] === maxScore) {
            tie = true;
        }
    }

    var msg;
    if (tie) {
        msg = (typeof getTranslation !== 'undefined') ? getTranslation('status_draw') : 'Empate!';
    } else if (isAI && winner === 2) {
        msg = (typeof getTranslation !== 'undefined') ? getTranslation('win_ai') : 'IA Venceu!';
    } else {
        // p1_wins, p2_wins, p3_wins, p4_wins
        var key = 'p' + winner + '_wins';
        msg = (typeof getTranslation !== 'undefined') ? getTranslation(key) : ('P' + winner + ' Venceu!');
    }
    statusMsg.innerText = msg;
    return true;
}

/* ---- AI (greedy with difficulty) ---- */
function aiMove() {
    if (gameOver) return;

    var move = null;
    var all = getAllAvailableMoves();
    if (all.length === 0) return;

    if (aiDifficulty === 'easy') {
        // Easy: 15% chance to complete a square, otherwise fully random
        var completing = findCompletingMove();
        if (completing && Math.random() < 0.15) {
            move = completing;
        } else {
            move = all[Math.floor(Math.random() * all.length)];
        }
    } else if (aiDifficulty === 'medium') {
        // Medium: current greedy - always completes squares, 50% chance to play safe
        move = findCompletingMove();
        if (!move) {
            var safe = findSafeMoves();
            if (safe.length > 0 && Math.random() < 0.5) {
                move = safe[Math.floor(Math.random() * safe.length)];
            } else {
                move = all[Math.floor(Math.random() * all.length)];
            }
        }
    } else {
        // Hard: 98% optimal (completes squares, avoids giving squares), 2% random mistake
        if (Math.random() < 0.02) {
            move = all[Math.floor(Math.random() * all.length)];
        } else {
            move = findCompletingMove();
            if (!move) {
                var safe = findSafeMoves();
                move = (safe.length > 0)
                    ? safe[Math.floor(Math.random() * safe.length)]
                    : all[Math.floor(Math.random() * all.length)];
            }
        }
    }

    if (move) makeMove(move.type, move.r, move.c);
}

function findCompletingMove() {
    for (var r = 0; r < boardSize - 1; r++) {
        for (var c = 0; c < boardSize - 1; c++) {
            if (squares[r][c] !== 0) continue;
            if (countLines(r, c) === 3) {
                if (!horizontalLines[r][c])     return { type: 'h', r: r,   c: c };
                if (!horizontalLines[r+1][c])   return { type: 'h', r: r+1, c: c };
                if (!verticalLines[r][c])       return { type: 'v', r: r,   c: c };
                if (!verticalLines[r][c+1])     return { type: 'v', r: r,   c: c+1 };
            }
        }
    }
    return null;
}

function findSafeMoves() {
    var all = getAllAvailableMoves();
    var safe = [];
    for (var i = 0; i < all.length; i++) {
        if (isSafeMove(all[i].type, all[i].r, all[i].c)) safe.push(all[i]);
    }
    return safe;
}

function isSafeMove(type, r, c) {
    if (type === 'h') {
        if (r > 0        && countLines(r-1, c) >= 2) return false;
        if (r < boardSize-1 && countLines(r,   c) >= 2) return false;
    } else {
        if (c > 0        && countLines(r, c-1) >= 2) return false;
        if (c < boardSize-1 && countLines(r, c)   >= 2) return false;
    }
    return true;
}

function countLines(r, c) {
    var n = 0;
    if (horizontalLines[r][c])   n++;
    if (horizontalLines[r+1][c]) n++;
    if (verticalLines[r][c])     n++;
    if (verticalLines[r][c+1])   n++;
    return n;
}

function getAllAvailableMoves() {
    var moves = [];
    for (var r = 0; r < boardSize; r++) {
        for (var c = 0; c < boardSize - 1; c++) {
            if (!horizontalLines[r][c]) moves.push({ type: 'h', r: r, c: c });
        }
    }
    for (var r = 0; r < boardSize - 1; r++) {
        for (var c = 0; c < boardSize; c++) {
            if (!verticalLines[r][c]) moves.push({ type: 'v', r: r, c: c });
        }
    }
    return moves;
}

// Wait for DOM before init
if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', init);
} else {
    window.onload = init;
}
