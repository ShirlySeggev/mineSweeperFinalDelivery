'use strict';

const BEGGINER = 4;
const BEGGINER_MINES = 2;
const MEDIUM = 8;
const MEDIUM_MINES = 12;
const EXPERT = 12;
const EXPERT_MINES = 30;
const MINE = '💣';
const FLAG = '🚩';
const SMILE_NORMAL = '😃';
const SMILE_DEAD = '🤯';
const SMILE_WIN = '😎';

var gModalTimeOut;
var gStartTime;
var gTimerInterval;
var gHintTimeOut;
var gSafeTimeOut;
var gIsHint = false;
var gIsManual = false;
var gManualCount = 0;
var gSteps = [];
var gBoard;
var gLevel = {
    SIZE: BEGGINER,
    MINES: BEGGINER_MINES
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    hints: 3,
    safeClicks: 3
};


function initGame() {
    gBoard = buildBoard(gLevel);
    renderBoard(gBoard);
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.lives = 3;
    gGame.hints = 3;
    gGame.safeClicks = 3;
    gIsHint = false;
    gIsManual = false;
    gManualCount = 0;
    gSteps = [];
    renderElement('.mines-count span', gLevel.MINES - gGame.markedCount);
    renderElement('.timer', gGame.secsPassed);
    renderElement('.smile', SMILE_NORMAL);
    renderElement('.lives span', gGame.lives);
    initHintStyle();
    updateBestScores();
    initManuallyStyle();
}

function buildBoard(level) {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = createCell();
            board[i][j] = cell;
        }
    }
    return board;
}

function createCell() {
    var cell = {
        minesAroundCount: null,
        isShown: false,
        isMine: false,
        isMarked: false
    };
    return cell;
}

function setRandMines(posI, posJ) {
    var emptyCells = getEmptyCells(gBoard, posI, posJ);

    for (var i = 0; i < gLevel.MINES; i++) {
        var cell = emptyCells[getRandomInt(0, emptyCells.length - 1)];
        var idx = emptyCells.indexOf(cell);
        emptyCells.splice(idx, 1);
        gBoard[cell.i][cell.j].minesAroundCount = MINE; 	// update Model
        gBoard[cell.i][cell.j].isMine = true;
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) continue;
            gBoard[i][j].minesAroundCount = getMinesNegsCount(gBoard, i, j);
        }
    }
}

function getMinesNegsCount(board, i, j) {
    var pos = { i: i, j: j };
    var countMines = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isMine) countMines++;
        }
    }
    return countMines;
}

function getEmptyCells(board, posI, posJ) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (i === posI && j === posJ) continue;
            var currCellPos = { i, j };
            var currCell = board[i][j];
            if (!currCell.isMine) {
                emptyCells.push(currCellPos);
            }
        }
    }
    return emptyCells;
}

function renderBoard(board) {
    var strHtml = '';
    var cellValue = '';
    var cellFlag = '';

    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>\n'
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            var className = (cell.isMine) ? 'mine' : '';
            if (cell.isShown) {
                className += 'shown';
                cellValue = gBoard[i][j].minesAroundCount;
            }
            else if (cell.isMarked) {
                className += 'marked';
                cellFlag = FLAG;
            }
            strHtml += `\t<td class="cell-${i}-${j} ${className}"
            onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="cellMarked(this, ${i}, ${j} ); return false;">
            ${cellValue} ${cellFlag} 
            </td>\n`
            cellValue = '';
            cellFlag = '';
        }
        strHtml += '</tr>\n'
    }
    // console.log(strHtml);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
}

function cellClicked(elCell, i, j) {
    if (gIsManual) {
        playManual(i, j);
        return;
    }
    startGameTimer();
    if (gGame.hints > 0 && gIsHint) {
        gGame.hints--;
        gIsHint = false;
        getHint(i, j);
        return;
    }
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].minesAroundCount === null) playFirstMove(elCell, i, j);
    else if (gBoard[i][j].isMine) {
        var currMove = { i: i, j: j };
        gSteps.push(currMove);
        if (gGame.lives > -1) updateLives(elCell);
        else gameOver(elCell);
        return;
    }
    else if (gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, elCell, i, j);
    else {
        var currMove = { i: i, j: j };
        gSteps.push(currMove);
        gBoard[i][j].isShown = true; //update model
        gGame.shownCount++;
        elCell.classList.add('shown'); //update DOM
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
    }
    checkGameOver();
}

function cellMarked(elCell, i, j) {
    elCell.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        return false;
    }, false);
    if (!gGame.isOn) return;
    startGameTimer();
    if (gGame.markedCount >= gLevel.MINES && !gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false; //update model
        gGame.markedCount--;
        elCell.classList.remove('shown');
        elCell.innerHTML = ''; //render DOM
    } else {
        gBoard[i][j].isMarked = true; //update model
        gGame.markedCount++;
        elCell.classList.add('shown');
        elCell.innerHTML = FLAG; //render DOM
        var currMove = { i: i, j: j };
        gSteps.push(currMove);
    }
    renderElement('.mines-count span', gLevel.MINES - gGame.markedCount);
    checkGameOver();
}

function checkGameOver() {
    var numToShown = gLevel.SIZE ** 2 - gLevel.MINES;
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === numToShown) {
        renderElement('.smile', SMILE_WIN);
        var currBest = localStorage.getItem(`${gLevel.SIZE}`);
        if (currBest === null || currBest > gGame.secsPassed) {
            localStorage.setItem(`${gLevel.SIZE}`, gGame.secsPassed);
        }
        clearTimeout(gTimerInterval);
        gGame.isOn = false;
    }
}

function expandShown(board, elCell, i, j) {
    var pos = { i: i, j: j };
    if (board[i][j].minesAroundCount !== 0) return;
    for (var idxi = pos.i - 1; idxi <= pos.i + 1; idxi++) {
        if (idxi < 0 || idxi > board.length - 1) continue;
        for (var idxj = pos.j - 1; idxj <= pos.j + 1; idxj++) {
            if (idxj < 0 || idxj > board[0].length - 1) continue;
            if (!board[idxi][idxj].isShown) {
                if (board[idxi][idxj].isMarked) {
                    gGame.markedCount--;
                    renderElement('.mines-count span', gLevel.MINES - gGame.markedCount);
                }
                board[idxi][idxj].isShown = true; //update model
                gGame.shownCount++;
                var elNeighCell = document.querySelector(`.cell-${idxi}-${idxj}`) //render DOM
                elNeighCell.classList.add('shown');
                elNeighCell.innerHTML = board[idxi][idxj].minesAroundCount;
                var currMove = { i: idxi, j: idxj };
                gSteps.push(currMove);
                expandShown(board, elCell, idxi, idxj);
            }
        }
    }
}

function gameLevel(elButton) {
    if (elButton.classList.contains('begginer')) {
        gLevel.SIZE = BEGGINER;
        gLevel.MINES = BEGGINER_MINES;
    } else if (elButton.classList.contains('medium')) {
        gLevel.SIZE = MEDIUM;
        gLevel.MINES = MEDIUM_MINES;
    } else {
        gLevel.SIZE = EXPERT;
        gLevel.MINES = EXPERT_MINES;
    }
    changeBottonsStyle(elButton);
    playAgain();
}

function playAgain() {
    clearInterval(gTimerInterval);
    initGame();
}

function startGameTimer() {
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        gStartTime = Date.now();
        gTimerInterval = setInterval(function () {
            gGame.secsPassed = parseInt((Date.now() - gStartTime) / 1000);
            renderElement('.timer', gGame.secsPassed);
        }, 1000);
    }
}

function updateLives(elCell) {
    gGame.lives--;
    if (gGame.lives < 0) gameOver(elCell);
    else {
        openModal();
        renderElement('.lives span', gGame.lives);
    }
}

function gameOver(elCell) {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    renderElement('.smile', SMILE_DEAD);
    elCell.style.backgroundColor = '#F44336';
    var elCells = document.querySelectorAll('.mine');
    for (var idx = 0; idx < elCells.length; idx++) {
        elCells[idx].innerHTML = MINE; //update DOM
    }
}

function openModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';
    renderElement('.modal span', gGame.lives);
    gModalTimeOut = setTimeout(function () {
        closeModal();
    }, 1000);
}

function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
    clearTimeout(gModalTimeOut);
}

function revealHint(elHint) {
    if (!gGame.isOn) return;
    if (gGame.hints <= 0) return;
    changeButtonStyle(elHint);
    gIsHint = true;
}

function getHint(i, j) {
    revealNeighboors(i, j);
    gHintTimeOut = setTimeout(function () {
        renderBoard(gBoard);
    }, 1000);
    gIsHint = false;
}

function revealNeighboors(i, j) {
    var pos = { i: i, j: j };
    for (var idxi = pos.i - 1; idxi <= pos.i + 1; idxi++) {
        if (idxi < 0 || idxi > gBoard.length - 1) continue;
        for (var idxj = pos.j - 1; idxj <= pos.j + 1; idxj++) {
            if (idxj < 0 || idxj > gBoard[0].length - 1) continue;
            if (!gBoard[idxi][idxj].isShown) {
                var elHintCell = document.querySelector(`.cell-${idxi}-${idxj}`) //render DOM
                elHintCell.innerHTML = gBoard[idxi][idxj].minesAroundCount;
            }
        }
    }
}

function updateBestScores() {
    var scores = [];
    for (var i = 0; i < localStorage.length; i++) {
        var score = {
            level: +localStorage.key(i),
            time: localStorage.getItem(localStorage.key(i))
        };
        scores[i] = score;
    }
    sortScoresByLevel(scores);
    renderElement('.begginer-score span', scores[0].time);
    renderElement('.medium-score span', scores[1].time);
    renderElement('.expert-score span', scores[2].time);
}

function safeClick() {
    if (gGame.safeClicks <= 0) return;
    gGame.safeClicks--;
    getSave();
    gSafeTimeOut = setTimeout(function () {
        renderBoard(gBoard);
    }, 1000);
    renderElement('.safe span', gGame.safeClicks);
}

function getSave() {
    var unShownCells = getUnshownCells();
    var unShownCell = unShownCells[getRandomInt(0, unShownCells.length - 1)];
    var elUnShownCell = document.querySelector(`.cell-${unShownCell.i}-${unShownCell.j}`)
    elUnShownCell.innerHTML = gBoard[unShownCell.i][unShownCell.j].minesAroundCount;
    elUnShownCell.style.backgroundColor = '#FFFF00';
    elUnShownCell.style.color = '#F44336';
}

function getUnshownCells() {
    var unShownCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCellPos = { i, j };
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) unShownCells.push(currCellPos);
        }
    }
    return unShownCells;
}

function manualClick(elManual) {
    if (gGame.isOn) return;
    changeButtonStyle(elManual);
    changeElementDisplay('.manual-count', 'block');
    renderElement('.manual-count span', gLevel.MINES);
    gIsManual = true;
}

function playManual(i, j) {
    if (gManualCount < gLevel.MINES) {
        if (gBoard[i][j].isMine) return;
        setManualMines(i, j);
        gManualCount++;
        renderElement('.manual-count span', gLevel.MINES - gManualCount);
        if (gLevel.MINES - gManualCount === 0) {
            setMinesNegsCount();
            renderBoard(gBoard);
            changeElementDisplay('.manual-text', 'block');
            gIsManual = false;
            gGame.isOn = true;
        }
    }
}

function setManualMines(i, j) {
    gBoard[i][j].minesAroundCount = MINE; 	// update Model
    gBoard[i][j].isMine = true;
}

function playFirstMove(elCell, i, j) {
    gGame.isOn = true;
    setRandMines(i, j);
    setMinesNegsCount();
    gBoard[i][j].isShown = true; //update model
    gGame.shownCount++;
    var currMove = { i: i, j: j };
    gSteps.push(currMove);
    renderBoard(gBoard);
    if (gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, elCell, i, j);
}


function undo() {
    if (!gGame.isOn) return;
    var undo = gSteps.pop();

    if (gBoard[undo.i][undo.j].isMarked) {
        gGame.markedCount--;
        gBoard[undo.i][undo.j].isMarked = false;
        renderElement('.mines-count span', gLevel.MINES - gGame.markedCount);
    } else if (gBoard[undo.i][undo.j].isMine) {
        gGame.lives++;
        renderElement('.lives span', gGame.lives);
    } else if (gBoard[undo.i][undo.j].isShown) {
        gBoard[undo.i][undo.j].isShown = false;
        gGame.shownCount--;
    }
    var elCell = document.querySelector(`.cell-${undo.i}-${undo.j}`);
    elCell.classList.remove('shown');
    elCell.classList.remove('marked');
    elCell.innerHTML = '';
}
