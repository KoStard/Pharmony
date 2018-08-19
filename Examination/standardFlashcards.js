/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop
};

const {createButton} = require('./../Universals');
const examinationUniversals = require('./examinationUniversals');

let container = document.getElementById('container');
let examinationContainer = document.getElementById("examination-container");
let examination = document.getElementById("examination");
let data;

function start(dataInput){
    data = dataInput;
}

function stop(){
    examinationUniversals.clearExamination(examination);
}