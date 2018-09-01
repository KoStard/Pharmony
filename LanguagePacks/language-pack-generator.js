/* jshint esversion: 6 */
module.exports = {
    getLPs: ()=>data,
    generateLanguagePack: generateLanguagePack
};
const fs = require("fs");
let data = JSON.parse(fs.readFileSync('./LanguagePacks/language-packs.json'));

// Just call this function to add language pack and make colors better
// You can give lowerTo, upperTo or just leave them undefined
function generateLanguagePack({languageName, alphabetLength, lowerFrom, lowerTo, upperFrom, upperTo}){
    if (!alphabetLength || !lowerFrom || !upperFrom) return false;
    data[languageName] = {
        length: alphabetLength,
        lower: {
            from: lowerFrom,
            to: lowerTo || String.fromCharCode(lowerFrom.charCodeAt(0) + alphabetLength - 1)
        }, upper: {
            from: upperFrom,
            to: upperTo || String.fromCharCode(upperFrom.charCodeAt(0) + alphabetLength - 1)
        },
    };
    saveLP();
}

function saveLP(){
    fs.writeFileSync('./LanguagePacks/language-packs.json', JSON.stringify(data));
}