var setupScreen = document.getElementById('setup-screen');
var passScreen = document.getElementById('pass-screen');
var fleetScreen = document.getElementById('fleet-screen');
var gameScreen = document.getElementById('game-screen');

var attackBoardElement = document.getElementById('attack-board');
var defenseBoardElement = document.getElementById('defense-board');
var fleetBoardElement = document.getElementById('fleet-board');
var statusMessage = document.getElementById('status-message');
var shipListUI = document.getElementById('ship-list-ui');

var btnPvE = document.getElementById('btn-pve');
var btnPvP = document.getElementById('btn-pvp');
var btnStartMode = document.getElementById('btn-start-mode');

var gameMode = 'pve'; // pve or pvp
var gameState = 'MODE_SELECT'; 
var currentPlayer = 1;

var boards = {
    1: { ships: [], hits: [] }, // ships[i] = 0(none), 1(p1 ship part), etc.
    2: { ships: [], hits: [] }
};

// Advanced Ship Tracking for Placement
var fleetShips = {
    1: [], // objects { size, r, c, vertical, placed }
    2: []
};

var totalShipCells = 17;
var shipSizes = [5, 4, 3, 3, 2];
var selectedShipIndex = -1;
var placementVertical = false;

var stats = {
    1: { shots: 0, hits: 0, shipsLeft: 5 },
    2: { shots: 0, hits: 0, shipsLeft: 5 }
};

function initGame() {
    window.addEventListener('langChanged', function() {
        if (gameState === 'MODE_SELECT') {
            selectMode(gameMode);
        }
    });
    setTimeout(function() {
        selectMode('pve');
    }, 100);
}

function selectMode(selectedMode) {
    gameMode = selectedMode;
    document.getElementById('btn-pvp').style.backgroundColor = gameMode === 'pvp' ? 'black' : 'white';
    document.getElementById('btn-pvp').style.color = gameMode === 'pvp' ? 'white' : 'black';
    document.getElementById('btn-pve').style.backgroundColor = gameMode === 'pve' ? 'black' : 'white';
    document.getElementById('btn-pve').style.color = gameMode === 'pve' ? 'white' : 'black';
    
    var descText = document.getElementById('diff-desc-text');
    if (descText) {
        if (gameMode === 'pve') descText.innerText = typeof getTranslation !== 'undefined' ? getTranslation('bs_pve_desc') : 'PvE';
        if (gameMode === 'pvp') descText.innerText = typeof getTranslation !== 'undefined' ? getTranslation('bs_pvp_desc') : 'PvP';
    }
    btnStartMode.style.display = 'inline-block';
}

function startSetup() {
    setupScreen.style.display = 'none';
    currentPlayer = 1;
    
    // Reset Boards & Stats
    for (var p = 1; p <= 2; p++) {
        boards[p].ships = [];
        boards[p].hits = [];
        fleetShips[p] = [];
        stats[p] = { shots: 0, hits: 0, shipsLeft: 5 };
        for (var i = 0; i < 100; i++) {
            boards[p].ships.push(0);
            boards[p].hits.push(0);
        }
        // Initialize ship objects
        for (var s = 0; s < shipSizes.length; s++) {
            fleetShips[p].push({ size: shipSizes[s], r: -1, c: -1, vertical: false, placed: false, sunk: false });
        }
    }
    
    // AI setup if PvE
    if (gameMode === 'pve') {
        boards[2].ships = generateRandomBoard(2);
    }
    
    showFleetPlacement();
}

function generateRandomBoard(player) {
    var b = [];
    for (var i = 0; i < 100; i++) b.push(0);
    var ships = fleetShips[player];
    for (var s = 0; s < ships.length; s++) {
        var size = ships[s].size;
        var placed = false;
        while (!placed) {
            var isVertical = Math.random() > 0.5;
            var r = Math.floor(Math.random() * (isVertical ? (10 - size + 1) : 10));
            var c = Math.floor(Math.random() * (isVertical ? 10 : (10 - size + 1)));
            var canPlace = true;
            for (var l = 0; l < size; l++) {
                if (b[(r + (isVertical?l:0)) * 10 + (c + (isVertical?0:l))] === 1) {
                    canPlace = false; break;
                }
            }
            if (canPlace) {
                for (var l2 = 0; l2 < size; l2++) {
                    b[(r + (isVertical?l2:0)) * 10 + (c + (isVertical?0:l2))] = 1;
                }
                ships[s].r = r;
                ships[s].c = c;
                ships[s].vertical = isVertical;
                ships[s].placed = true;
                placed = true;
            }
        }
    }
    return b;
}

function showFleetPlacement() {
    gameState = 'FLEET_PLACEMENT';
    passScreen.style.display = 'none';
    fleetScreen.style.display = 'block';
    document.getElementById('fleet-title').innerText = typeof getTranslation !== 'undefined' ? getTranslation('p' + currentPlayer + '_fleet') : 'Fleet';
    
    // Select first unplaced ship by default
    selectedShipIndex = -1;
    for (var i = 0; i < fleetShips[currentPlayer].length; i++) {
        if (!fleetShips[currentPlayer][i].placed) {
            selectedShipIndex = i;
            break;
        }
    }

    renderPlacementUI();
}

function renderPlacementUI() {
    renderShipList();
    renderPlacementBoard();
}

function renderShipList() {
    shipListUI.innerHTML = '';
    var ships = fleetShips[currentPlayer];
    for (var i = 0; i < ships.length; i++) {
        (function(index) {
            var ship = ships[index];
            var li = document.createElement('li');
            li.className = 'ship-item';
            if (ship.placed) li.className += ' placed';
            if (index === selectedShipIndex) li.className += ' selected';
            
            var shipName = typeof getTranslation !== 'undefined' ? getTranslation('ship_' + ship.size) : 'Ship ' + ship.size;
            li.innerText = shipName;
            li.onclick = function() {
                selectedShipIndex = index;
                renderPlacementUI();
            };
            shipListUI.appendChild(li);
        })(i);
    }
}

function renderPlacementBoard() {
    fleetBoardElement.innerHTML = '';
    var myBoard = boards[currentPlayer].ships;
    var allPlaced = true;
    for (var s = 0; s < fleetShips[currentPlayer].length; s++) {
        if (!fleetShips[currentPlayer][s].placed) allPlaced = false;
    }

    var hint = document.getElementById('placement-hint');
    if (selectedShipIndex !== -1 && !fleetShips[currentPlayer][selectedShipIndex].placed) {
        hint.innerText = typeof getTranslation !== 'undefined' ? getTranslation('bs_place_hint') + getTranslation('ship_' + fleetShips[currentPlayer][selectedShipIndex].size) : 'Place ship';
    } else if (allPlaced) {
        hint.innerText = typeof getTranslation !== 'undefined' ? getTranslation('bs_all_placed') : 'All ships placed!';
    } else {
        hint.innerText = typeof getTranslation !== 'undefined' ? getTranslation('bs_manual_start') : 'Select a ship';
    }

    document.getElementById('btn-confirm-fleet').style.display = allPlaced ? 'inline-block' : 'none';
    document.getElementById('btn-rotate').style.display = (selectedShipIndex !== -1 && !fleetShips[currentPlayer][selectedShipIndex].placed) ? 'inline-block' : 'none';


    for (var i = 0; i < 100; i++) {
        (function(index) {
            var cell = document.createElement('div');
            cell.className = 'battleship-cell';
            
            var r = Math.floor(index / 10);
            var c = index % 10;
            
            // Highlight current ship parts
            if (myBoard[index] === 1) {
                cell.className += ' ship-part';
            }

            // Check if this cell is valid for current selection
            if (selectedShipIndex !== -1 && !fleetShips[currentPlayer][selectedShipIndex].placed) {
                var size = fleetShips[currentPlayer][selectedShipIndex].size;
                
                // If collision at target r,c
                // (Note: we highlight ALL cells if they are part of an invalid placement? 
                // Or just gray out if placing STARTING here is invalid)
                if (!canPlaceHere(r, c, size, placementVertical)) {
                    cell.className += ' invalid-pos';
                }
            }

            cell.onclick = function() { handlePlacementClick(index); };
            fleetBoardElement.appendChild(cell);
            if ((index + 1) % 10 === 0) {
                var br = document.createElement('div'); br.className = 'clearfix'; fleetBoardElement.appendChild(br);
            }
        })(i);
    }
}

function canPlaceHere(r, c, size, vertical) {
    if (vertical) {
        if (r + size > 10) return false;
    } else {
        if (c + size > 10) return false;
    }
    var b = boards[currentPlayer].ships;
    for (var l = 0; l < size; l++) {
        var rr = r + (vertical ? l : 0);
        var cc = c + (vertical ? 0 : l);
        if (b[rr * 10 + cc] === 1) return false;
    }
    return true;
}

function handlePlacementClick(index) {
    var b = boards[currentPlayer].ships;
    var r = Math.floor(index / 10);
    var c = index % 10;

    // If clicking on an existing ship -> REMOVE it
    if (b[index] === 1) {
        var shipToRem = null;
        var ships = fleetShips[currentPlayer];
        for (var s = 0; s < ships.length; s++) {
            if (ships[s].placed) {
                var rr = ships[s].r;
                var cc = ships[s].c;
                var sz = ships[s].size;
                var vert = ships[s].vertical;
                for (var l = 0; l < sz; l++) {
                    var curR = rr + (vert ? l : 0);
                    var curC = cc + (vert ? 0 : l);
                    if (curR === r && curC === c) {
                        shipToRem = ships[s];
                        break;
                    }
                }
            }
            if (shipToRem) break;
        }

        if (shipToRem) {
            // Remove from board
            var rr = shipToRem.r;
            var cc = shipToRem.c;
            var sz = shipToRem.size;
            var vert = shipToRem.vertical;
            for (var l = 0; l < sz; l++) {
                b[(rr + (vert ? l : 0)) * 10 + (cc + (vert ? 0 : l))] = 0;
            }
            shipToRem.placed = false;
            shipToRem.r = -1;
            shipToRem.c = -1;
            renderPlacementUI();
            return;
        }
    }

    // Else if ship selected -> PLACE it
    if (selectedShipIndex !== -1 && !fleetShips[currentPlayer][selectedShipIndex].placed) {
        var ship = fleetShips[currentPlayer][selectedShipIndex];
        if (canPlaceHere(r, c, ship.size, placementVertical)) {
            for (var l = 0; l < ship.size; l++) {
                b[(r + (placementVertical ? l : 0)) * 10 + (c + (placementVertical ? 0 : l))] = 1;
            }
            ship.placed = true;
            ship.r = r;
            ship.c = c;
            ship.vertical = placementVertical;
            
            // Auto-select next unplaced
            selectedShipIndex = -1;
            for (var i = 0; i < fleetShips[currentPlayer].length; i++) {
                if (!fleetShips[currentPlayer][i].placed) {
                    selectedShipIndex = i;
                    break;
                }
            }
            renderPlacementUI();
        }
    }
}

function togglePlacementRotation() {
    placementVertical = !placementVertical;
    var btn = document.getElementById('btn-rotate');
    if (btn) {
        btn.style.backgroundColor = placementVertical ? 'black' : 'white';
        btn.style.color = placementVertical ? 'white' : 'black';
    }
    renderPlacementBoard();
}

function shuffleCurrentFleet() {
    // Clear current player's board and fleetShips state
    for (var i = 0; i < 100; i++) boards[currentPlayer].ships[i] = 0;
    for (var s = 0; s < fleetShips[currentPlayer].length; s++) {
        fleetShips[currentPlayer][s] = { size: shipSizes[s], r: -1, c: -1, vertical: false, placed: false, sunk: false };
    }

    boards[currentPlayer].ships = generateRandomBoard(currentPlayer);
    selectedShipIndex = -1;
    renderPlacementUI();
}

function confirmFleet() {
    // Check if all ships are placed
    var allPlaced = true;
    for (var s = 0; s < fleetShips[currentPlayer].length; s++) {
        if (!fleetShips[currentPlayer][s].placed) {
            allPlaced = false;
            break;
        }
    }
    if (!allPlaced) {
        statusMessage.innerText = typeof getTranslation !== 'undefined' ? getTranslation('bs_place_all_ships') : 'Please place all ships!';
        return;
    }

    if (gameMode === 'pve') {
        gameState = 'PLAYING';
        fleetScreen.style.display = 'none';
        startTurn();
    } else {
        if (currentPlayer === 1) {
            currentPlayer = 2;
            if (boards[2].ships.length === 0 || boards[2].ships.indexOf(1) === -1) {
                // Initialize P2 if not done
                for(var i=0; i<100; i++) boards[2].ships[i] = 0;
                for(var s=0; s<shipSizes.length; s++) fleetShips[2][s] = { size: shipSizes[s], r: -1, c: -1, vertical: false, placed: false, sunk: false };
            }
            fleetScreen.style.display = 'none';
            triggerPassDevice();
        } else {
            currentPlayer = 1;
            fleetScreen.style.display = 'none';
            triggerPassDevice();
            gameState = 'PLAYING';
        }
    }
}

function triggerPassDevice() {
    gameScreen.style.display = 'none';
    fleetScreen.style.display = 'none';
    passScreen.style.display = 'block';
    document.getElementById('pass-title').innerText = typeof getTranslation !== 'undefined' ? getTranslation('status_turn_p' + currentPlayer) : 'Player ' + currentPlayer;
}

function acknowledgePass() {
    passScreen.style.display = 'none';
    if (gameState === 'FLEET_PLACEMENT') {
        showFleetPlacement();
    } else if (gameState === 'PLAYING') {
        startTurn();
    }
}

function updateStatsUI() {
    var p = currentPlayer;
    var enemyId = p === 1 ? 2 : 1;
    document.getElementById('stat-shots').innerText = stats[p].shots;
    document.getElementById('stat-hits').innerText = stats[p].hits;
    
    // Count remaining (unsunk) ships for ENEMY
    var enemyShips = fleetShips[enemyId];
    var left = 0;
    for (var s = 0; s < enemyShips.length; s++) {
        if (!enemyShips[s].sunk) left++;
    }
    document.getElementById('stat-left').innerText = left;
}

function checkSunk(targetPlayer) {
    var b = boards[targetPlayer].ships;
    var h = boards[targetPlayer].hits;
    var ships = fleetShips[targetPlayer];
    var newlySunkSize = 0;
    
    for (var s = 0; s < ships.length; s++) {
        if (ships[s].sunk) continue;
        var sunk = true;
        var r = ships[s].r;
        var c = ships[s].c;
        var sz = ships[s].size;
        var v = ships[s].vertical;
        for (var l = 0; l < sz; l++) {
            var curR = r + (v ? l : 0);
            var curC = c + (v ? 0 : l);
            if (h[curR * 10 + curC] !== 2) {
                sunk = false;
                break;
            }
        }
        if (sunk) {
            ships[s].sunk = true;
            newlySunkSize = sz;
        }
    }
    return newlySunkSize;
}

function startTurn() {
    gameScreen.style.display = 'block';
    document.getElementById('post-game-controls').style.display = 'none';
    
    var enemyId = currentPlayer === 1 ? 2 : 1;
    var myId = currentPlayer;
    
    document.getElementById('defense-title').innerText = typeof getTranslation !== 'undefined' ? getTranslation('p' + currentPlayer + '_fleet') : 'Your Fleet';
    statusMessage.innerText = typeof getTranslation !== 'undefined' ? getTranslation('status_turn_p' + currentPlayer) : 'Your Turn';

    updateStatsUI();

    // Render Attack Board (Enemy)
    attackBoardElement.innerHTML = '';
    for (var i = 0; i < 100; i++) {
        (function(index) {
            var cell = document.createElement('div');
            cell.className = 'battleship-cell';
            
            var r = Math.floor(index / 10);
            var c = index % 10;
            var hitState = boards[enemyId].hits[index];
            
            // Check if this cell belongs to a sunk ship
            var isSunk = false;
            var enemyShips = fleetShips[enemyId];
            for (var s = 0; s < enemyShips.length; s++) {
                if (enemyShips[s].sunk) {
                    var sr = enemyShips[s].r;
                    var sc = enemyShips[s].c;
                    var sz = enemyShips[s].size;
                    var sv = enemyShips[s].vertical;
                    for (var l = 0; l < sz; l++) {
                        if ((sr + (sv ? l : 0)) === r && (sc + (sv ? 0 : l)) === c) {
                            isSunk = true; break;
                        }
                    }
                }
                if (isSunk) break;
            }

            if (isSunk) {
                cell.className += ' sunk'; cell.innerHTML = 'X';
            } else if (hitState === 1) {
                cell.className += ' miss'; cell.innerHTML = 'O';
            } else if (hitState === 2) {
                cell.className += ' hit'; cell.innerHTML = 'X';
            } else {
                cell.innerHTML = '<span style="visibility:hidden">X</span>';
                cell.onclick = function() { registerAttack(index); };
            }
            attackBoardElement.appendChild(cell);
            if ((index + 1) % 10 === 0) {
                var br = document.createElement('div'); br.className = 'clearfix'; attackBoardElement.appendChild(br);
            }
        })(i);
    }
    
    // Render Defense Board (Self) - Mini
    defenseBoardElement.innerHTML = '';
    for (var j = 0; j < 100; j++) {
        var cellSelf = document.createElement('div');
        cellSelf.className = 'battleship-cell';
        var myShip = boards[myId].ships[j];
        var myHitState = boards[myId].hits[j];
        
        var rSelf = Math.floor(j / 10);
        var cSelf = j % 10;
        var mySunk = false;
        var myShips = fleetShips[myId];
        for (var s2 = 0; s2 < myShips.length; s2++) {
            if (myShips[s2].sunk) {
                var sr2 = myShips[s2].r;
                var sc2 = myShips[s2].c;
                var sz2 = myShips[s2].size;
                var sv2 = myShips[s2].vertical;
                for (var l2 = 0; l2 < sz2; l2++) {
                    if ((sr2 + (sv2 ? l2 : 0)) === rSelf && (sc2 + (sv2 ? 0 : l2)) === cSelf) {
                        mySunk = true; break;
                    }
                }
            }
            if (mySunk) break;
        }

        if (mySunk) {
            cellSelf.className += ' sunk'; cellSelf.innerHTML = 'X';
        } else if (myHitState === 2) {
            cellSelf.className += ' hit'; cellSelf.innerHTML = '<span style="color:black">X</span>';
        } else if (myShip === 1) {
            cellSelf.className += ' ship-part';
        }
        
        if (myHitState === 1) {
            cellSelf.className += ' miss'; cellSelf.innerHTML = 'O';
        }
        
        if (!cellSelf.innerHTML) {
            cellSelf.innerHTML = '<span style="visibility:hidden">X</span>';
        }
        
        defenseBoardElement.appendChild(cellSelf);
        if ((j + 1) % 10 === 0) {
            var br2 = document.createElement('div'); br2.className = 'clearfix'; defenseBoardElement.appendChild(br2);
        }
    }
}

function registerAttack(index) {
    if (gameState !== 'PLAYING') return;
    var enemyId = currentPlayer === 1 ? 2 : 1;
    if (boards[enemyId].hits[index] !== 0) return;
    
    stats[currentPlayer].shots++;
    var isHit = boards[enemyId].ships[index] === 1;
    boards[enemyId].hits[index] = isHit ? 2 : 1;
    
    var newlySunkSize = 0;
    if (isHit) {
        stats[currentPlayer].hits++;
        newlySunkSize = checkSunk(enemyId);
    }
    
    updateStatsUI();

    var hitsScored = 0;
    for(var k=0; k<100; k++) if(boards[enemyId].hits[k] === 2) hitsScored++;
    
    if (hitsScored >= totalShipCells) {
        startTurn();
        gameState = 'GAME_OVER';
        statusMessage.innerText = typeof getTranslation !== 'undefined' ? getTranslation('status_win') : 'Winner!';
        document.getElementById('post-game-controls').style.display = 'block';
        return;
    }

    if (newlySunkSize > 0) {
        statusMessage.innerText = (typeof getTranslation !== 'undefined' ? getTranslation('ship_' + newlySunkSize) : 'Ship') + ' SUNK!';
    }
    
    if (gameMode === 'pvp') {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        setTimeout(function() { triggerPassDevice(); }, 2000);
    } else {
        startTurn();
        if (newlySunkSize > 0) {
            // Keep sunk message for a bit
            setTimeout(aiTurn, 1000);
        } else {
            aiTurn();
        }
    }
}

function aiTurn() {
    statusMessage.innerText = typeof getTranslation !== 'undefined' ? getTranslation('status_turn_ai') : 'AI thinking...';
    gameState = 'AI_WAITING';
    setTimeout(function() {
        var aiAttacked = false;
        while(!aiAttacked) {
            var aiChoice = Math.floor(Math.random() * 100);
            if (boards[1].hits[aiChoice] === 0) {
                stats[2].shots++;
                var aiHit = boards[1].ships[aiChoice] === 1;
                boards[1].hits[aiChoice] = aiHit ? 2 : 1;
                if (aiHit) {
                    stats[2].hits++;
                    checkSunk(1);
                }
                aiAttacked = true;
            }
        }
        var aiHits = 0;
        for(var a=0; a<100; a++) if(boards[1].hits[a] === 2) aiHits++;
        if (aiHits >= totalShipCells) {
            gameState = 'GAME_OVER';
            startTurn();
            statusMessage.innerText = typeof getTranslation !== 'undefined' ? getTranslation('status_lose') : 'You Lost!';
            document.getElementById('post-game-controls').style.display = 'block';
        } else {
            gameState = 'PLAYING';
            startTurn();
        }
    }, 800);
}

function weightedDelay(base) {
    return base; // placeholder
}

function resetToMenu() {
    gameScreen.style.display = 'none';
    setupScreen.style.display = 'block';
    gameState = 'MODE_SELECT';
}

document.addEventListener('DOMContentLoaded', initGame);
