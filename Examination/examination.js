/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop,
    init: init,
    toggleToModeSelection: toggleToModeSelection
};

let container = document.getElementById('container');
let examinationContainer = document.getElementById("examination-container");
let examinationModes = document.getElementById("examination-modes");
let examinationModeButtons = document.getElementById("examination-mode-buttons");
let examination = document.getElementById("examination");


let data = {};

let runningMode = '';
const modes = {
    'Standard Flashcards': require('./standardFlashcards')
};
const {createButton} = require('./../Universals');

function toggleToModeSelection(){
    if (runningMode){
        modes[runningMode].stop();
        examination.innerHTML = '';
        runningMode = '';
    }
}

function loadModeButtons() {
    for (let element of examinationModes.childNodes){
        if (element != examinationModeButtons) {
            element.remove();
        }
    }
    examinationModeButtons.innerHTML = '';
    for (let key in modes){
        createButton({
            value: key,
            buttonClass: 'examination-mode-button',
            onclick: ()=>{modes[key].start(); runningMode = key;},
            owner: examinationModeButtons
        });
    }
    createButton({
        value: "Close examination",
        buttonClass: 'examination-mode-close-button',
        onclick: stop,
        owner: examinationModes
    });
}

function start(dataInput){
    container.className = 'examination-mode-selection';
    data = dataInput;
    loadModeButtons();
}

function stop(){
    container.className = 'main';
}