/* jshint esversion: 6 */
const {
    createButton
} = require('./../Elements/button');
const {
    hoverColorMaker
} = require('./../Colors/colorFuncs');
const examinationUniversals = require('./examinationUniversals');
const examinationController = require('./examination');

const container = document.getElementById('container');
const examinationContainer = document.getElementById("examination-container");
const examination = document.getElementById("examination");
const backButtons = document.getElementById("backButtons");
const accessoriesNode = examination.getElementsByClassName('accessories')[0];

let autoRefresh = true;

let data, blocks;
let currentFlashcard;

function createStatus(name, text, color) {
    return Object.freeze({
        name: name,
        text: text,
        color: color,
        hoverColor: hoverColorMaker(color)
    });
}

const statusEnum = Object.freeze({
    raw: createStatus('raw', "Raw", '#e65100'),
    inProcess: createStatus('inProcess', "In Process", "#279ca0"),
    finished: createStatus('finished', "Finished", "#43a047")
});

let playlist = {
    waiting: [
        []
    ],
    finished: []
}; // playlist - groups - names x 20
let playlistGroupSize = 20;

function createPlaylist(sequence) {
    playlist = {
        waiting: [
            []
        ],
        finished: []
    };
    for (let name of sequence) {
        if (blocks[name].individual.standardFlashcards.status != statusEnum.finished.name)
            playlist.waiting[playlist.waiting.length - 1].push(name);
        else
            playlist.finished.push(name);
        if (playlist.waiting[playlist.waiting.length - 1].length >= playlistGroupSize) {
            playlist.waiting.push([]); // Creating new group
        }
    }
    return playlist;
}

function checkGroupStatus(index) {
    for (let element of playlist.waiting[index]) {
        if (blocks[element].individual.standardFlashcards.status != statusEnum.finished.name)
            return false;
    }
    return true;
}

let sequence;

function createTable(playlist) {
    let table = document.createElement('table');
    for (let groupIndex in playlist.waiting) {
        for (let blockName of playlist.waiting[groupIndex]) {
            const row = document.createElement('tr');
            let cell = document.createElement('td');
            cell.className = 'standardFlashcardsIntroduction-front';
            cell.innerText = blockName;
            cell.ondblclick = () => {
                examinationUniversals.clearExamination();
                createPlaylist(sequence.slice(sequence.indexOf(blockName), sequence.length));
                main();
            };
            row.appendChild(cell);
            table.appendChild(row);

            cell = document.createElement('td');
            cell.className = 'standardFlashcardsIntroduction-status';
            if (!blocks[blockName].individual.standardFlashcards.status) {
                blocks[blockName].individual.standardFlashcards.status = statusEnum.raw.name;
                blocks[blockName].individual.standardFlashcards.realEffort = 0;
            }
            cell.ondblclick = () => {
                blocks[blockName].individual.standardFlashcards.status = Object.keys(statusEnum)[Object.keys(statusEnum).indexOf(blocks[blockName].individual.standardFlashcards.status) == 2 ? 0 : 2];
                globals.save();
                if (autoRefresh) {
                    createPlaylist(sequence);
                    examinationUniversals.resetIntroductoryScreenContent(createTable(getPlaylist()));
                } else {
                    cell.innerText = statusEnum[blocks[blockName].individual.standardFlashcards.status].text;
                    cell.style.backgroundColor = statusEnum[blocks[blockName].individual.standardFlashcards.status].color;
                }
                refreshContinueButtonVisibility();
            };
            cell.innerText = statusEnum[blocks[blockName].individual.standardFlashcards.status].text;
            cell.style.backgroundColor = statusEnum[blocks[blockName].individual.standardFlashcards.status].color;
            row.appendChild(cell);
            table.appendChild(row);
        }
        if (groupIndex != playlist.waiting.length - 1 || playlist.finished.length > 0) {
            const row = document.createElement('tr');
            row.className = 'insulationRow';
            let cell = document.createElement('td');
            row.appendChild(cell);
            cell = document.createElement('td');
            row.appendChild(cell);
            table.appendChild(row);
        }
    }
    for (let blockName of playlist.finished) {
        const row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.innerText = blockName;
        row.appendChild(cell);
        table.appendChild(row);

        cell = document.createElement('td');
        cell.className = 'standardFlashcardsIntroduction-status';
        cell.ondblclick = () => {
            blocks[blockName].individual.standardFlashcards.status = Object.keys(statusEnum)[Object.keys(statusEnum).indexOf(blocks[blockName].individual.standardFlashcards.status) == 2 ? 0 : 2];
            globals.save();
            if (autoRefresh) {
                createPlaylist(sequence);
                examinationUniversals.resetIntroductoryScreenContent(createTable(getPlaylist()));
            } else {
                cell.innerText = statusEnum[blocks[blockName].individual.standardFlashcards.status].text;
                cell.style.backgroundColor = statusEnum[blocks[blockName].individual.standardFlashcards.status].color;
            }
            refreshContinueButtonVisibility();
        };
        cell.innerText = statusEnum[blocks[blockName].individual.standardFlashcards.status].text;
        cell.style.backgroundColor = statusEnum[blocks[blockName].individual.standardFlashcards.status].color;
        row.appendChild(cell);
        table.appendChild(row);
    }
    return table;
}

let getPlaylist = () => playlist;

const shuffleArray = arr => arr
    .map(a => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1]);

let continueButton;
let continueButtonVisibility = false;

function refreshContinueButtonVisibility(manual) {
    if (!manual) {
        continueButtonVisibility = (playlist.waiting.length && Object.keys(data.global.standardFlashcards).includes('last') && blocks[data.global.standardFlashcards.last].individual.standardFlashcards.status != statusEnum.finished.name);
    }
    continueButton.style.display = continueButtonVisibility ? 'block' : 'none';
}

function createIntroductoryScreen() {
    backButtons.style.display = 'none';
    currentFlashcard = undefined;
    accessories.hide();
    createPlaylist(sequence);
    continueButtonVisibility = (playlist.waiting.length && Object.keys(data.global.standardFlashcards).includes('last') && blocks[data.global.standardFlashcards.last].individual.standardFlashcards.status != statusEnum.finished.name);
    let table = createTable(playlist);
    continueButton = {};
    new examinationUniversals.createIntroductoryScreen({
        content: table,
        buttons: [
            createButton({
                value: 'Close',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    examinationUniversals.clearExamination();
                    examinationController.toggleToModeSelection();
                },
            }),
            createButton({
                value: 'Initial',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    sequence = Object.keys(blocks);
                    createPlaylist(sequence);
                    table = createTable(playlist);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                    if (data.global.standardFlashcards.last) {
                        continueButton.style.display = 'block';
                    }
                }
            }),
            createButton({
                value: 'Shuffle',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    sequence = shuffleArray(sequence);
                    createPlaylist(sequence);
                    table = createTable(playlist);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                    continueButton.style.display = 'none';
                }
            }),
            createButton({
                value: 'Restart',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    for (let name in blocks) {
                        blocks[name].individual.standardFlashcards.status = statusEnum.raw.name;
                    }
                    globals.save();
                    createPlaylist(sequence);
                    table = createTable(playlist);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                }
            }),
            createButton({
                value: 'Invert',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    for (let name in blocks) {
                        blocks[name].individual.standardFlashcards.status = Object.keys(statusEnum)[Object.keys(statusEnum).indexOf(blocks[name].individual.standardFlashcards.status) == 2 ? 0 : 2];
                    }
                    globals.save();
                    createPlaylist(sequence);
                    table = createTable(playlist);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                }
            }),
            createButton({
                value: 'Start',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    if (playlist.waiting[0].length > 0) {
                        examinationUniversals.clearExamination();
                        main();
                    }
                }
            }),
            createButton({
                value: 'Continue',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    if (playlist.waiting[0].length > 0) {
                        main(data.global.standardFlashcards.last); // Last will be name
                    }
                },
                style: {
                    display: continueButtonVisibility ? 'block' : 'none'
                },
                saveIn: continueButton
            }),
        ],
        start: function () {
            if (this.buttons[6].style.display != 'none')
                this.buttons[6].click();
            else
                this.buttons[5].click();
        }
    });
    continueButton = continueButton.button;
}

let globals;

function start(dataInput, args) {
    globals = args;
    examinationUniversals.clearExamination();
    data = dataInput;
    blocks = data.blocks;
    currentFlashcard = null;
    sequence = Object.keys(blocks);
    createIntroductoryScreen();
}

let flashcard;

function main(name) {
    examinationUniversals.turnOnExaminationSettingsButton();
    flashcard = runFlashcard(name);
    flashcard.next();
}

let done = false;

function next() {
    if (!done && flashcard.next().done) {
        finish();
    }
}

function finish() {
    done = true;
    examinationUniversals.clearExamination();
    createIntroductoryScreen();
}

const maxCycles = 3;

function* runFlashcard(last_name) {
    let found_last_name = false;
    done = false;
    let cycle = 0;
    accessories.show();
    accessories.progressBarData.groupsNum = playlist.waiting.length;
    for (let groupIndex in playlist.waiting) {
        cycle = 0;
        // Initial size
        accessories.progressBarData.currentGroupSize = playlist.waiting[groupIndex].length;
        accessories.progressBarData.progress = 0;
        accessories.progressBarData.currentGroupIndex = parseInt(groupIndex) + 1;
        // Group running size
        accessories.progressBarData.runSize = playlist.waiting[groupIndex].length;
        while (!checkGroupStatus(groupIndex)) {
            cycle += 1;
            if (cycle > maxCycles) break;
            accessories.progressBarData.currentIndex = 0;
            accessories.progressBarData.runSize = playlist.waiting[groupIndex].length;
            for (let name of playlist.waiting[groupIndex]) {
                if (blocks[name].individual.standardFlashcards.status != statusEnum.finished.name) {
                    accessories.progressBarData.currentIndex += 1;
                    if (last_name == name) {
                        found_last_name = true;
                    }
                    if (!last_name || (last_name && found_last_name)) {
                        accessories.refreshProgressBar();
                        data.global.standardFlashcards.last = name;
                        globals.save();
                        yield new Flashcard(name, blocks[name].description);
                        if (blocks[name].individual.standardFlashcards.status == statusEnum.finished.name) {
                            accessories.progressBarData.progress += 1;
                        }
                    }
                }
            }
            // Filtering processed data of waiting group
            let temp = [];
            for (let name of playlist.waiting[groupIndex]) {
                if (blocks[name].individual.standardFlashcards.status == statusEnum.finished.name) {
                    playlist.finished.push(name);
                } else {
                    temp.push(name);
                }
            }
            playlist.waiting[groupIndex] = temp;
        }
    }
}
let accessories;

function createAccessories() {
    accessories = this;
    backButtons.style.justifyContent = 'center';

    let f = function (b, statusName) {
        b.style.backgroundColor = statusEnum[statusName].color;
        b.onmouseenter = function () {
            this.style.backgroundColor = statusEnum[statusName].hoverColor;
        };
        b.onmouseleave = function () {
            this.style.backgroundColor = statusEnum[statusName].color;
        };
    };

    this.raw = createButton({
        value: statusEnum.raw.text,
        buttonClass: 'popup-standart popup-button',
        onclick: () => {
            blocks[currentFlashcard.front].individual.standardFlashcards.status = statusEnum.raw.name;
            globals.save();
            resetAccessoriesSelection();
            next();
        },
        owner: backButtons
    });
    f(this.raw, 'raw');

    this.inProcess = createButton({
        value: statusEnum.inProcess.text,
        buttonClass: 'popup-standart popup-button',
        onclick: () => {
            blocks[currentFlashcard.front].individual.standardFlashcards.status = statusEnum.inProcess.name;
            globals.save();
            resetAccessoriesSelection();
            next();
        },
        owner: backButtons
    });
    f(this.inProcess, 'inProcess');

    this.finished = createButton({
        value: statusEnum.finished.text,
        buttonClass: 'popup-standart popup-button',
        onclick: () => {
            blocks[currentFlashcard.front].individual.standardFlashcards.status = statusEnum.finished.name;
            globals.save();
            resetAccessoriesSelection();
            next();
        },
        owner: backButtons
    });
    f(this.finished, 'finished');

    this.pressed = undefined;
    this.press = (name) => {
        this.unpressAll();
        this.pressed = name;
        this[name].style.backgroundColor = statusEnum[name].hoverColor;
    };

    this.unpress = (name) => {
        if (this.pressed == name) this.pressed = undefined;
        this[name].style.backgroundColor = statusEnum[name].color;
    };

    this.unpressAll = () => {
        this.unpress('raw');
        this.unpress('inProcess');
        this.unpress('finished');
    };

    this.click = (name) => {
        if (name == this.pressed) {
            blocks[currentFlashcard.front].individual.standardFlashcards.status = name;
            this.unpressAll();
            globals.save();
            resetAccessoriesSelection();
            next();
        }
    };

    this.waitingForMainButtonClick = false;

    this.mainButtonPressed = () => {
        this.waitingForMainButtonClick = true;
        this.press(Object.keys(statusEnum)[Object.keys(statusEnum).indexOf(blocks[currentFlashcard.front].individual.standardFlashcards.status) == 0 ? 1 : 2]);
    };

    this.mainButtonClicked = () => {
        if (this.waitingForMainButtonClick)
            this.click(Object.keys(statusEnum)[Object.keys(statusEnum).indexOf(blocks[currentFlashcard.front].individual.standardFlashcards.status) == 0 ? 1 : 2]);
    };
    this.progressBar = (() => {
        let el = document.createElement('div');
        el.className = 'flashcards-progress-bar';
        return el;
    })();
    this.progressBarData = {
        currentIndex: 0,
        runSize: 0,
        progress: 0,
        currentGroupSize: 0,
        currentGroupIndex: 0,
        groupsNum: 0
    };
    accessoriesNode.appendChild(this.progressBar);
    this.refreshProgressBar = () => {
        this.progressBar.innerHTML =
            `Current <span>${this.progressBarData.currentIndex}</span>/<span>${this.progressBarData.runSize}</span><br>
        Finished <span>${this.progressBarData.progress}</span>/<span>${this.progressBarData.currentGroupSize}</span><br>
        Group <span>${this.progressBarData.currentGroupIndex}</span>/<span>${this.progressBarData.groupsNum}</span>`;
    };

    this.show = () => {
        this.progressBar.style.display = 'block';
    };

    this.hide = () => {
        this.progressBar.style.display = 'none';
    };
}

function resetAccessoriesSelection() {
    Object.keys(statusEnum).forEach((st) => {
        accessories[st].className = 'popup-standart popup-button';
    });
    accessories[blocks[currentFlashcard.front].individual.standardFlashcards.status].className += ' selected';
}

function getCurrentFlashcard() {
    return currentFlashcard;
}

function Flashcard(front, back) {

    back = back.split(";");

    backButtons.style.display = 'none';
    currentFlashcard = this;
    this.front = front;
    this.back = back;
    this.accessories = accessories;

    examinationUniversals.clearExamination();
    const flashcardNode = document.createElement('div');
    this.flashcardNode = flashcardNode;
    flashcardNode.className = 'flashcard front';
    const frontSide = document.createElement('div');
    let content = document.createElement('div');
    content.innerText = front;
    frontSide.className = 'front';
    frontSide.appendChild(content);
    flashcardNode.appendChild(frontSide);

    const backSide = document.createElement('div');
    content = document.createElement('ol');

    // backText = "";
    // for (let i = 0; i < back.length; i++) {
    //     if (back.length > 1) {
    //         if (back[i])
    //             backText += `${i + 1}. ${back[i]}\n`;
    //     } else {
    //         backText += back[i];
    //     }
    // }

    let index = 0;
    let innerHTML = '';
    for (let sep of back) {
        innerHTML += sep[0] != '#' ? (back.length > 1 ? `<li>${sep}</li>` : `<div>${sep}</div>`) : `<div><b>${sep.slice(1)}</b></div>`;
    }

    content.innerHTML = innerHTML;
    // content.innerText = backText;
    backSide.className = 'back';
    backSide.appendChild(content);
    flashcardNode.prepend(backSide);
    // examination.insertBefore(flashcardNode, examination.childNodes[examination.childNodes.length - 1]);
    examination.prepend(flashcardNode);

    this.rotate = function () {
        if (flashcardNode.className == 'flashcard front') {
            backButtons.style.display = 'flex';
            flashcardNode.className = 'flashcard both';
        }
    };
    resetAccessoriesSelection();
}

function stop() {
    examinationUniversals.turnOffExaminationSettingsButton();
    examinationUniversals.clearExamination();
    accessories.hide();
    sequence = undefined;
    currentFlashcard = undefined;
    backButtons.style.display = 'none';
}
module.exports = {
    start: start,
    stop: stop,
    createIntroductoryScreen: createIntroductoryScreen,
    createAccessories: createAccessories,
    getCurrentFlashcard: getCurrentFlashcard,
    statusEnum: statusEnum,
};