/* jshint esversion: 6 */
const examinationSettingsButtonContainer = document.getElementById('examination-settings-button-container');
const examinationSettingsButtonContent = examinationSettingsButtonContainer.children.item(0).getElementsByClassName('dropdown-content').item(0);

module.exports = {
    clearExamination: clearExamination,
    createIntroductoryScreen: createIntroductoryScreen,
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

function createIntroductoryScreen({content, buttons}){
    const introductoryScreen = document.createElement('div');
    introductoryScreen.className = 'introductory-screen';
    const introductoryScreenContent = document.createElement('div');
    introductoryScreenContent.className = 'introductory-screen-content';
    introductoryScreenContent.appendChild(content);
    const introductoryScreenPanel = document.createElement('div');
    introductoryScreenPanel.className = 'introductory-screen-panel';
    for (let button of buttons) {
        introductoryScreenPanel.appendChild(button);
    }
    introductoryScreen.appendChild(introductoryScreenContent);
    introductoryScreen.appendChild(introductoryScreenPanel);
    clearExamination();
    examination.appendChild(introductoryScreen);
}