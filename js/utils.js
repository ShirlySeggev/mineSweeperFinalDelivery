function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
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

function changeButtonStyle(elButton) {
    elButton.style.backgroundColor = '#7E7E7E';
    elButton.style.borderWidth = '0px';
}

function initHintStyle() {
    var elHints = document.querySelectorAll('.hint');
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].style.backgroundColor = 'white';
        elHints[i].style.borderWidth = '3px';
    }
}

function sortScoresByLevel(scores) {
    scores.sort(function (a, b) {
        return a.level - b.level
    });
}

function changeElementDisplay(el, display) {
    var elElement = document.querySelector(el);
    elElement.style.display = display;
}

function initManuallyStyle() {
    var elManual = document.querySelector('.manual');
    elManual.style.backgroundColor = 'white';
    elManual.style.borderWidth = '3px';
    changeElementDisplay('.manual-count', 'none');
    changeElementDisplay('.manual-text', 'none');
}