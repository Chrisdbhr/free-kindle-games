// Strict ES5 Only! Kindle target.

var gridWidth = 0;
var gridHeight = 0;
var selectedCell = null; // {r: row, c: col}
var typingDirection = 'across'; // 'across' or 'down'
var cellsData = []; // 2D array: cellsData[r][c] = { answer: 'A', user: '', num: 1, isBlack: false }
var currentClues = { across: [], down: [] };
var targetDifficulty = 'easy';
var usedWordsList = [];

function initGame() {
    document.getElementById('setup-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    
    window.addEventListener('langChanged', function() {
        if (document.getElementById('game-screen').style.display === 'block') {
            // Already in game
        }
    });
}

function startGame(difficulty) {
    targetDifficulty = difficulty;
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('status-message').innerHTML = "";
    
    selectedCell = null;
    typingDirection = 'across';
    
    generateCrossword();
    renderBoard();
    renderClues();
    renderKeyboard();
}

function generateCrossword() {
    if (targetDifficulty === 'easy') {
        gridWidth = 6;
        gridHeight = 6;
    } else if (targetDifficulty === 'medium') {
        gridWidth = 8;
        gridHeight = 8;
    } else {
        gridWidth = 10;
        gridHeight = 10;
    }

    cellsData = [];
    for (var r = 0; r < gridHeight; r++) {
        var row = [];
        for (var c = 0; c < gridWidth; c++) {
            row.push({ isBlack: true, answer: '', user: '', num: 0 });
        }
        cellsData.push(row);
    }
    
    currentClues = { across: [], down: [] };
    usedWordsList = [];

    var wordBank = [];
    if (window.translations && translations[currentLang]) {
        if (targetDifficulty === 'easy' && translations[currentLang].words_short) {
            wordBank = translations[currentLang].words_short.slice();
        } else if (targetDifficulty === 'medium' && translations[currentLang].words_medium) {
            wordBank = translations[currentLang].words_medium.slice();
        } else if (translations[currentLang].words_long) {
            wordBank = translations[currentLang].words_long.slice();
        }
    }
    
    if (wordBank.length === 0) {
        wordBank = ["KINDLE", "GAME", "EINK", "PAPERWHITE", "TEST", "BOOK", "READ", "PAGE"];
    }

    wordBank.sort(function() { return 0.5 - Math.random(); });
    
    var placedWordsCount = 0;
    var maxAttempts = 100; // Increased attempts
    
    for (var i = 0; i < wordBank.length && placedWordsCount < (targetDifficulty==='easy'?3:targetDifficulty==='medium'?5:8) && maxAttempts > 0; i++) {
        var word = wordBank[i].toUpperCase();
        if (word.length > gridWidth && word.length > gridHeight) continue;

        if (placedWordsCount === 0) {
            var startR = Math.floor(gridHeight / 2);
            var startC = Math.max(0, Math.floor((gridWidth - word.length) / 2));
            if (canPlaceWord(word, startR, startC, 1, 0)) {
                placeWord(word, startR, startC, 1, 0);
                placedWordsCount++;
            }
        } else {
            var placed = false;
            for (var c1 = 0; c1 < word.length && !placed; c1++) {
                var letterToMatch = word.charAt(c1);
                for (var r = 0; r < gridHeight && !placed; r++) {
                    for (var c = 0; c < gridWidth && !placed; c++) {
                        if (!cellsData[r][c].isBlack && cellsData[r][c].answer === letterToMatch) {
                            var horizC = c - c1;
                            if (canPlaceWord(word, r, horizC, 1, 0)) {
                                placeWord(word, r, horizC, 1, 0);
                                placed = true;
                                placedWordsCount++;
                            }
                            if (!placed) {
                                var vertR = r - c1;
                                if (canPlaceWord(word, vertR, c, 0, 1)) {
                                    placeWord(word, vertR, c, 0, 1);
                                    placed = true;
                                    placedWordsCount++;
                                }
                            }
                        }
                    }
                }
            }
        }
        maxAttempts--;
    }
    
    numberCellsAndGenerateClues();
}

function canPlaceWord(word, startR, startC, dC, dR) {
    if (startR < 0 || startC < 0) return false;
    if (startC + (word.length * dC) > gridWidth) return false;
    if (startR + (word.length * dR) > gridHeight) return false;
    
    for (var i = 0; i < word.length; i++) {
        var r = startR + (i * dR);
        var c = startC + (i * dC);
        var cell = cellsData[r][c];
        
        if (!cell.isBlack && cell.answer !== word.charAt(i)) return false;
        
        if (cell.isBlack) {
            if (dC === 1) { 
                if (r > 0 && !cellsData[r-1][c].isBlack) return false;
                if (r < gridHeight - 1 && !cellsData[r+1][c].isBlack) return false;
            } else { 
                if (c > 0 && !cellsData[r][c-1].isBlack) return false;
                if (c < gridWidth - 1 && !cellsData[r][c+1].isBlack) return false;
            }
        }
    }
    
    if (dC === 1) {
        if (startC > 0 && !cellsData[startR][startC - 1].isBlack) return false;
        if (startC + word.length < gridWidth && !cellsData[startR][startC + word.length].isBlack) return false;
    } else {
        if (startR > 0 && !cellsData[startR - 1][startC].isBlack) return false;
        if (startR + word.length < gridHeight && !cellsData[startR + word.length][startC].isBlack) return false;
    }
    
    return true;
}

function placeWord(word, startR, startC, dC, dR) {
    for (var i = 0; i < word.length; i++) {
        var r = startR + (i * dR);
        var c = startC + (i * dC);
        cellsData[r][c].isBlack = false;
        cellsData[r][c].answer = word.charAt(i);
    }
    usedWordsList.push({word: word, r: startR, c: startC, dC: dC, dR: dR});
}

function numberCellsAndGenerateClues() {
    var cellNumber = 1;
    for (var r = 0; r < gridHeight; r++) {
        for (var c = 0; c < gridWidth; c++) {
            cellsData[r][c].num = 0;
        }
    }
    
    for (var r = 0; r < gridHeight; r++) {
        for (var c = 0; c < gridWidth; c++) {
            if (cellsData[r][c].isBlack) continue;
            
            var prevLeft = c > 0 ? !cellsData[r][c-1].isBlack : false;
            var nextRight = c < gridWidth - 1 ? !cellsData[r][c+1].isBlack : false;
            var prevTop = r > 0 ? !cellsData[r-1][c].isBlack : false;
            var nextBottom = r < gridHeight - 1 ? !cellsData[r+1][c].isBlack : false;
            
            var startsAcross = (!prevLeft && nextRight);
            var startsDown = (!prevTop && nextBottom);
            
            if (startsAcross || startsDown) {
                cellsData[r][c].num = cellNumber;
                if (startsAcross) {
                    var theWord = "";
                    var tc = c;
                    while(tc < gridWidth && !cellsData[r][tc].isBlack) {
                        theWord += cellsData[r][tc].answer;
                        tc++;
                    }
                    currentClues.across.push({ num: cellNumber, text: scrambleWord(theWord) });
                }
                if (startsDown) {
                    var theWordD = "";
                    var tr = r;
                    while(tr < gridHeight && !cellsData[tr][c].isBlack) {
                        theWordD += cellsData[tr][c].answer;
                        tr++;
                    }
                    currentClues.down.push({ num: cellNumber, text: scrambleWord(theWordD) });
                }
                cellNumber++;
            }
        }
    }
}

function scrambleWord(word) {
    if (!word || word.length <= 1) return word;
    var arr = word.split('');
    var attempts = 20;
    while(attempts > 0) {
        arr.sort(function() { return 0.5 - Math.random(); });
        var res = arr.join('');
        if (res !== word) return res.split('').join(' ');
        attempts--;
    }
    return arr.join(' ');
}

function renderBoard() {
    var boardHtml = '';
    var boardPixelWidth = (gridWidth * 32); 
    document.getElementById('crosswords-board').style.width = boardPixelWidth + 'px';
    
    for (var r = 0; r < gridHeight; r++) {
        for (var c = 0; c < gridWidth; c++) {
            var cell = cellsData[r][c];
            if (cell.isBlack) {
                boardHtml += '<div class="cw-cell cw-black"><span style="visibility:hidden">X</span></div>';
            } else {
                var isSelected = (selectedCell && selectedCell.r === r && selectedCell.c === c) ? ' selected' : '';
                var isRowSelected = (selectedCell && typingDirection === 'across' && selectedCell.r === r && isWordBlock(r, selectedCell.c, r, c)) ? ' typing-row' : '';
                var isColSelected = (selectedCell && typingDirection === 'down' && selectedCell.c === c && isWordBlock(selectedCell.r, c, r, c)) ? ' typing-row' : '';
                var highlightSelected = isSelected || isRowSelected || isColSelected;
                
                var numHtml = cell.num > 0 ? '<div class="cw-num">' + cell.num + '</div>' : '';
                var letterHtml = cell.user !== '' ? cell.user : '<span style="visibility:hidden">X</span>';
                
                boardHtml += '<div class="cw-cell' + (highlightSelected?' '+highlightSelected.trim():'') + '" onclick="selectCell(' + r + ',' + c + ')">';
                boardHtml += numHtml;
                boardHtml += '<div class="cw-letter">' + letterHtml + '</div>';
                boardHtml += '</div>';
            }
        }
        boardHtml += '<div class="clearfix"></div>';
    }
    document.getElementById('crosswords-board').innerHTML = boardHtml;
}

function isWordBlock(startR, startC, targetR, targetC) {
    if (typingDirection === 'across') {
        var minC = Math.min(startC, targetC);
        var maxC = Math.max(startC, targetC);
        for (var c = minC; c <= maxC; c++) {
            if (cellsData[startR][c].isBlack) return false;
        }
        return true;
    } else {
        var minR = Math.min(startR, targetR);
        var maxR = Math.max(startR, targetR);
        for (var r = minR; r <= maxR; r++) {
            if (cellsData[r][startC].isBlack) return false;
        }
        return true;
    }
}

function renderClues() {
    var acrossHtml = '';
    for (var i = 0; i < currentClues.across.length; i++) {
        var clue = currentClues.across[i];
        acrossHtml += '<li style="margin-bottom:3px; letter-spacing: 1px;"><strong>' + clue.num + '.</strong> ' + clue.text + '</li>';
    }
    document.getElementById('clues-across').innerHTML = acrossHtml;
    
    var downHtml = '';
    for (var j = 0; j < currentClues.down.length; j++) {
        var clueD = currentClues.down[j];
        downHtml += '<li style="margin-bottom:3px; letter-spacing: 1px;"><strong>' + clueD.num + '.</strong> ' + clueD.text + '</li>';
    }
    document.getElementById('clues-down').innerHTML = downHtml;
}

function renderKeyboard() {
    var rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    var kbHtml = '';
    for (var i = 0; i < rows.length; i++) {
        kbHtml += '<div style="display:inline-block; margin: 0 auto;">';
        for (var j = 0; j < rows[i].length; j++) {
            var letter = rows[i][j];
            kbHtml += '<button class="btn cw-key" onclick="typeLetter(\'' + letter + '\')">' + letter + '</button>';
        }
        if (i === 2) kbHtml += '<button class="btn cw-key" style="width: 50px;" onclick="typeLetter(\'DEL\')">DEL</button>';
        kbHtml += '</div><br/>';
    }
    document.getElementById('crosswords-kb').innerHTML = kbHtml;
}

function selectCell(r, c) {
    if (cellsData[r][c].isBlack) return;
    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
        typingDirection = (typingDirection === 'across') ? 'down' : 'across';
    } else {
        selectedCell = {r: r, c: c};
    }
    renderBoard();
}

function typeLetter(letter) {
    if (!selectedCell) return;
    var r = selectedCell.r;
    var c = selectedCell.c;
    
    if (letter === 'DEL') {
        cellsData[r][c].user = '';
        if (typingDirection === 'across' && c - 1 >= 0 && !cellsData[r][c-1].isBlack) selectedCell.c = c - 1;
        else if (typingDirection === 'down' && r - 1 >= 0 && !cellsData[r-1][c].isBlack) selectedCell.r = r - 1;
        renderBoard();
        return;
    }
    
    cellsData[r][c].user = letter;
    if (typingDirection === 'across' && c + 1 < gridWidth && !cellsData[r][c+1].isBlack) selectedCell.c = c + 1;
    else if (typingDirection === 'down' && r + 1 < gridHeight && !cellsData[r+1][c].isBlack) selectedCell.r = r + 1;
    
    renderBoard();
    checkWinCondition();
}

function checkWinCondition() {
    var isFull = true;
    var isCorrect = true;
    for (var r = 0; r < gridHeight; r++) {
        for (var c = 0; c < gridWidth; c++) {
            var cell = cellsData[r][c];
            if (!cell.isBlack) {
                if (cell.user === '') isFull = false;
                else if (cell.user !== cell.answer) isCorrect = false;
            }
        }
    }
    if (isFull && isCorrect) {
        var winMsg = getTranslation('crosswords_win');
        document.getElementById('status-message').innerHTML = '<span style="color:black; background:white; padding: 2px 5px; border: 2px solid black;">' + winMsg + '</span>';
        selectedCell = null;
        document.getElementById('crosswords-kb').innerHTML = '';
        renderBoard();
    }
}

function backToMenu() { window.location.href = "../index.html"; }

window.onload = function() { initGame(); };
