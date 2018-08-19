/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop,
    init: init,
};

let container = document.getElementById('container');
let examinationContainer = document.getElementById("examination-container");
let examinationModes = document.getElementById("examination-modes");
let examinationModeButtons = document.getElementById("examination-mode-buttons");
let examination = document.getElementById("examination");


let blocks = "";

const modes = {
    'Standard Flashcards': ()=>{},
};

let createButton;
function init(args){
    createButton = args.createButton;
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
            onclick: modes[key],
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

function start(blocksInput){
    container.className = 'examination';
    blocks = blocksInput;
    loadModeButtons();
}

function stop(){
    container.className = 'main';
}