/* jshint esversion: 6 */
module.exports = {
    getLPs: ()=>data,
    generateLanguagePack: generateLanguagePack
};
const fs = require("fs");
let data = JSON.parse(fs.readFileSync('./LanguagePacks/language-packs.json'));

// Just call this function to add language pack and make colors better
function generateLanguagePack({languageName, alphabetLength, lowerFrom, upperFrom}){
    if (!alphabetLength || !lowerFrom || !upperFrom) return false;
    data[languageName] = {
        length: alphabetLength,
        lower: {
            from: lowerFrom,
            to: String.fromCharCode(lowerFrom.charCodeAt(0)+alphabetLength-1)
        }, upper: {
            from: upperFrom,
            to: String.fromCharCode(upperFrom.charCodeAt(0) + alphabetLength - 1)
        },
    };
    saveLP();
}

function saveLP(){
    fs.writeFileSync('./LanguagePacks/language-packs.json', JSON.stringify(data));
}