function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCellPos = { i, j };
            var currCell = board[i][j];
            if (!currCell.isMine) {
                emptyCells.push(currCellPos);
            }
        }
    }
    return emptyCells;
}

function renderElement(el, value) {
    var elElement = document.querySelector(el);
    elElement.innerText = value;
}

function changeBottonsStyle(elButton) {
    var elButtons = document.querySelectorAll('.btn');
    for (var i = 0; i < elButtons.length; i++) {
        if (elButton === elButtons[i]) {
            elButtons[i].style.backgroundColor = 'white';
            elButtons[i].style.borderWidth = '2px';
        } else {
            elButtons[i].style.backgroundColor = '#F44336';
            elButtons[i].style.borderWidth = '0px';
        }
    }
}

function changeHintStyle(elHint) {
    elHint.style.backgroundColor = '#7E7E7E';
    elHint.style.borderWidth = '0px';
}

function initHintStyle() {
    var elHints = document.querySelectorAll('.hint');
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].style.backgroundColor = 'white';
        elHints[i].style.borderWidth = '3px';
    }
}