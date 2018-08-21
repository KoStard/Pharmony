/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop,
    next: next,
    createIntroductoryScreen: createIntroductoryScreen
};

const {createButton} = require('./../Universals');
const examinationUniversals = require('./examinationUniversals');
const examinationController = require('./examination');

const container = document.getElementById('container');
const examinationContainer = document.getElementById("examination-container");
const examination = document.getElementById("examination");
let data;

let sequence;
function createTable(sequence) {
    const table = document.createElement('table');
    for (let blockName of sequence) {
        const row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.innerText = blockName;
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
    table = createTable(sequence);
    examinationUniversals.createIntroductoryScreen({
        content: table,
        buttons: [
            createButton({
                value: 'Continue',
                buttonClass: 'popup-standart popup-button',
                onclick: ()=>{
                    examinationUniversals.clearExamination();
                    main();
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
                value: 'Reset',
                buttonClass: 'popup-standart popup-button',
                onclick: ()=>{
                    sequence = Object.keys(data.blocks);
                    table = createTable(sequence);
                    examinationUniversals.resetIntroductoryScreenContent(table);
                }
            }),
            createButton({
                value: 'Close',
                buttonClass: 'popup-standart popup-button',
                onclick: ()=>{examinationUniversals.clearExamination(); examinationController.toggleToModeSelection();},
            })
        ]
    });
}

function start(dataInput){
    examinationUniversals.clearExamination();
    data = dataInput;
    sequence = Object.keys(data.blocks)
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
        yield createFlashcard(name, data.blocks[name].description);
    }
}

function createFlashcard(front, back) {
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
}

function stop(){
    console.log("Here");
    examinationUniversals.turnOffExaminationSettingsButton();
    examinationUniversals.clearExamination();
    sequence = undefined;
}