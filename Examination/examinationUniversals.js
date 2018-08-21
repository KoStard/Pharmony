/* jshint esversion: 6 */
const examinationSettingsButtonContainer = document.getElementById('examination-settings-button-container');
const examinationSettingsButtonContent = examinationSettingsButtonContainer.getElementsByClassName('dropdown-content').item(0);

module.exports = {
    clearExamination: clearExamination,
    createIntroductoryScreen: createIntroductoryScreen,
    resetIntroductoryScreenContent: resetIntroductoryScreenContent,
    examinationSettingsButtonContainer: examinationSettingsButtonContainer,
    examinationSettingsButtonContent: examinationSettingsButtonContent,
    checkIfExaminationSettingsContentIsEmpty: checkIfExaminationSettingsContentIsEmpty,
    turnOffExaminationSettingsButton: turnOffExaminationSettingsButton,
    turnOnExaminationSettingsButton: turnOnExaminationSettingsButton,
    setExaminationSettingsContent: setExaminationSettingsContent,
};

const examination = document.getElementById("examination");

function clearExamination() {
    for (let element of examination.children) {
        if (element.className != 'accessories') {
            element.remove();
        }
    }
}

function setExaminationSettingsContent(buttons) {
    for (let button of buttons) examinationSettingsButtonContent.appendChild(button);
}

function checkIfExaminationSettingsContentIsEmpty(){
    return !!examinationSettingsButtonContent.children.length;
}
function turnOffExaminationSettingsButton() {
    examinationSettingsButtonContainer.style.display = 'none';
}
function turnOnExaminationSettingsButton() {
    examinationSettingsButtonContainer.style.display = 'block';
}
let introductoryScreen, introductoryScreenContent, introductoryScreenPanel;
function createIntroductoryScreen({content, buttons}){
    turnOffExaminationSettingsButton();
    introductoryScreen = document.createElement('div');
    introductoryScreen.className = 'introductory-screen';
    introductoryScreenContent = document.createElement('div');
    introductoryScreenContent.className = 'introductory-screen-content';
    introductoryScreenContent.appendChild(content);
    introductoryScreenPanel = document.createElement('div');
    introductoryScreenPanel.className = 'introductory-screen-panel';
    for (let button of buttons) {
        introductoryScreenPanel.appendChild(button);
    }
    introductoryScreen.appendChild(introductoryScreenContent);
    introductoryScreen.appendChild(introductoryScreenPanel);
    clearExamination();
    examination.appendChild(introductoryScreen);
}

function resetIntroductoryScreenContent(content) {
    if (introductoryScreenContent) {
        introductoryScreenContent.innerHTML = '';
        introductoryScreenContent.appendChild(content);
    }
}