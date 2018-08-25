/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop,
    next: next,
    createIntroductoryScreen: createIntroductoryScreen,
    createAccessories: createAccessories,
    getCurrentFlashcard: getCurrentFlashcard
};

const {createButton, hoverColorMaker} = require('./../Universals');
const examinationUniversals = require('./examinationUniversals');
const examinationController = require('./examination');

const container = document.getElementById('container');
const examinationContainer = document.getElementById("examination-container");
const examination = document.getElementById("examination");
const backButtons = document.getElementById("backButtons");

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
    inProcess: createStatus('inProcess', "In Process", "#006064"),
    finished: createStatus('finished', "Finished", "#43a047")
});


let sequence;
function createTable(sequence) {
    const table = document.createElement('table');
    for (let blockName of sequence) {
        const row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.innerText = blockName;
        row.appendChild(cell);
        table.appendChild(row);

        cell = document.createElement('td');
        cell.className = 'standardFlashcardsIntroduction-status';
        if (!blocks[blockName].individual.standardFlashcards.status) { 
            blocks[blockName].individual.standardFlashcards.status = statusEnum.raw.name; 
            blocks[blockName].individual.standardFlashcards.realEffort = 0;
        }
        cell.innerText = statusEnum[blocks[blockName].individual.standardFlashcards.status].text;
        cell.style.backgroundColor = statusEnum[blocks[blockName].individual.standardFlashcards.status].color;
        row.appendChild(cell);
        table.appendChild(row);
    }
    return table;
}

const shuffleArray = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);

function createIntroductoryScreen(){
    backButtons.style.display = 'none'; 
    currentFlashcard = undefined;
    table = createTable(sequence);
    examinationUniversals.createIntroductoryScreen({
        content: table,
        buttons: [
            createButton({
                value: 'Close',
                buttonClass: 'popup-standart popup-button',
                onclick: ()=>{examinationUniversals.clearExamination(); examinationController.toggleToModeSelection();},
            }),
            createButton({
                value: 'Initial',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    sequence = Object.keys(blocks);
                    table = createTable(sequence);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                }
            }),
            createButton({
                value: 'Shuffle',
                buttonClass: 'popup-standart popup-button',
                onclick: ()=>{
                    sequence = shuffleArray(sequence);
                    table = createTable(sequence);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                }
            }),
            createButton({
                value: 'Restart',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    for (let name in blocks) {
                        blocks[name].individual.standardFlashcards.status = statusEnum.raw.name;
                    }
                    table = createTable(sequence);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                }
            }),
            createButton({
                value: 'Start',
                buttonClass: 'popup-standart popup-button',
                onclick: () => {
                    examinationUniversals.clearExamination();
                    main();
                }
            })
        ]
    });
}

let globals;
function start(dataInput, args){
    globals = args;
    examinationUniversals.clearExamination();
    data = dataInput;
    blocks = data.blocks;
    currentFlashcard = null;
    sequence = Object.keys(blocks);
    createIntroductoryScreen();
}

let flashcard;
function main() {
    examinationUniversals.turnOnExaminationSettingsButton();
    flashcard = runFlashcard(sequence);
    flashcard.next();
}

let done = false;
function next() {
    if(!done && flashcard.next().done){
        finish();
    }
}

function finish(){
    done = true;
    examinationUniversals.clearExamination();
    createIntroductoryScreen(sequence);
}

function* runFlashcard(sequence) {
    done = false;
    for (let name of sequence){
        yield new Flashcard(name, blocks[name].description);
    }
}
let accessories;
function createAccessories() {
    accessories = this;
    backButtons.style.justifyContent = 'center';

    let f = function(b, statusName) {
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
}
function resetAccessoriesSelection() {
    Object.keys(accessories).forEach((st) => {
        accessories[st].className = 'popup-standart popup-button';
    });
    accessories[blocks[currentFlashcard.front].individual.standardFlashcards.status].className += ' selected';
}
function getCurrentFlashcard(){return currentFlashcard;}
function Flashcard(front, back) {
    backButtons.style.display = 'none';
    currentFlashcard = this;
    this.front = front;
    this.back = back;

    examinationUniversals.clearExamination();
    const flashcardNode = document.createElement('div');
    flashcardNode.className = 'flashcard front';
    const frontSide = document.createElement('div');
    let content = document.createElement('div');
    content.innerText = front;
    frontSide.className = 'front';
    frontSide.appendChild(content);
    flashcardNode.appendChild(frontSide);

    const backSide = document.createElement('div');
    content = document.createElement('div');
    content.innerText = back;
    backSide.className = 'back';
    backSide.appendChild(content);
    flashcardNode.appendChild(backSide);
    examination.appendChild(flashcardNode);

    this.rotate = function(){
        if (flashcardNode.className == 'flashcard front') {
            backButtons.style.display = 'flex';
            flashcardNode.className = 'flashcard both';
        }
    };
    resetAccessoriesSelection();
}

function stop(){
    examinationUniversals.turnOffExaminationSettingsButton();
    examinationUniversals.clearExamination();
    sequence = undefined;
    backButtons.style.display = 'none';
}