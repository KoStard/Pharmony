/* jshint esversion: 6 */
module.exports = {
    clearExamination: (examination)=>{
        for (let element of examination) {
            if (element.className != 'accessories') {
                element.remove();
            }
        }
    },
    createIntroductoryScreen: createIntroductoryScreen
};

function createIntroductoryScreen({content, buttons}){

}