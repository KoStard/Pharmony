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

function start(dataInput){
    examinationUniversals.clearExamination();
    data = dataInput;
    let sequence = Object.keys(data.blocks);
    table = createTable(sequence);
    examinationUniversals.createIntroductoryScreen({
        content: table,
        buttons: [
            createButton({
                value: 'Continue',
                buttonClass: 'popup-standart popup-button',
                onclick: ()=>{
                    examinationUniversals.clearExamination();
                    main(sequence);
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

function main(sequence) {
    console.log(sequence);
}

function stop(){
    examinationUniversals.clearExamination();
}