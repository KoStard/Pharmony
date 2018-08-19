/* jshint esversion: 6 */
module.exports = {
    start: start,
    stop: stop
};

let container = document.getElementById('container');
let examinationContainer = document.getElementById("examination-container");
let examination = document.getElementById("examination");

function start(){
    container.className = 'examination';
}

function stop(){
    container.className = 'examination-mode-selection';
}