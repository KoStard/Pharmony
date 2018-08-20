/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop
};

const {createButton} = require('./../Universals');
const examinationUniversals = require('./examinationUniversals');
const examinationController = require('./examination');

const container = document.getElementById('container');
const examinationContainer = document.getElementById("examination-container");
const examination = document.getElementById("examination");
let data;

function start(dataInput){
    examinationUniversals.clearExamination();
    data = dataInput;
    const table = document.createElement('table');
    for (let blockName in data.blocks) {
        const row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.innerText = blockName;
        row.appendChild(cell);
        table.appendChild(row);
    }
    examinationUniversals.createIntroductoryScreen({
        content: table,
        buttons: [
            createButton({
                value: 'Close',
                buttonClass: 'popup-standart popup-button',
                onclick: ()=>{examinationUniversals.clearExamination(); examinationController.toggleToModeSelection();},
            })
        ]
    });
}

function stop(){
    examinationUniversals.clearExamination();
}