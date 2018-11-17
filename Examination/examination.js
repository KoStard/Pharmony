/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop,
    init: init,
    toggleToModeSelection: toggleToModeSelection,
    getRunningExamination: getRunningExamination,
    toggleToIntroduction: toggleToIntroduction,
    createAccessories: createAccessories,
};

let container = document.getElementById('container');
let examinationContainer = document.getElementById("examination-container");
let examinationModes = document.getElementById("examination-modes");
let examinationModeButtons = document.getElementById("examination-mode-buttons");
let examination = document.getElementById("examination");


let data;

let runningMode = '';
// Examination modes
const modes = {
    'Standard Flashcards': require('./standardFlashcards')
};
const {
    createButton
} = require('./../Elements/button');
const examinationUniversals = require('./examinationUniversals');

const defaultExaminationSettingsButtonContent = [
    createButton({
        value: 'Viewer',
        onclick: () => {
            modes[runningMode].createIntroductoryScreen();
        }
    }),
    createButton({
        value: 'Main',
        onclick: () => {
            stop();
        }
    }),
    createButton({
        value: 'Menu',
        onclick: () => {
            toggleToModeSelection();
            container.className = 'menu';
        }
    })
];

examinationUniversals.setExaminationSettingsContent(defaultExaminationSettingsButtonContent);

function loadModeButtons() {
    for (let element of examinationModes.childNodes) {
        if (element != examinationModeButtons) {
            element.remove();
        }
    }
    examinationModeButtons.innerHTML = '';
    for (let key in modes) {
        createButton({
            value: key,
            buttonClass: 'examination-mode-button',
            onclick: () => {
                container.className = 'examination';
                modes[key].start(data, globals);
                runningMode = key;
            },
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

function start(dataInput) {
    container.className = 'examination-mode-selection';
    data = dataInput;
    loadModeButtons();
}

function toggleToModeSelection() {
    if (runningMode) {
        examinationUniversals.stop();
        modes[runningMode].stop();
        container.className = 'examination-mode-selection';
        examinationUniversals.clearExamination();
        runningMode = '';
    }
}

function toggleToIntroduction() {
    if (runningMode) {
        modes[runningMode].createIntroductoryScreen();
    }
}

function getRunningExamination() {
    if (runningMode) {
        return modes[runningMode];
    }
}

function createAccessories() {
    for (let mode in modes) {
        modes[mode].createAccessories();
    }
}

let globals;

function init(args) {
    createAccessories();
    globals = args;
}

function stop() {
    toggleToModeSelection();
    container.className = 'main';
}