/* jshint esversion: 6 */
module.exports = textToColor;

let min = (a, b) => {return ((a>b)?b:a);};

function parse(color, LPData, currentLang, currentLangLength) {
    let res = 0;
    for (let i = 0; i < color.length; i++){ 
        if (currentLang){
            res = res * (currentLangLength + 10) + (isNaN(color[i]) ? min(Math.abs(color.charCodeAt(i) - LPData[currentLang].lower.from.charCodeAt(0)), Math.abs(color.charCodeAt(i) - LPData[currentLang].upper.from.charCodeAt(0))) % (currentLangLength) + 10 : parseInt(color[i]));
        }
        else {
            res = res * 10 + (isNaN(color[i]) ? color.charCodeAt(i) % currentLangLength:parseInt(color[i]));
        }
    }
    return res;
}

function textToColor(color, LPGen) { //Function to turn the string into a color. Most important function. Enter the math factory.
    color = color.replace(/\s+/g, '');
    // color = color.replace(/[^a-zA-Z 0-9]+/g, '');
    let lengthC = color.length; //length of the string
    let amount = Math.ceil(lengthC/3); //Determine length of the 3 parts that will define R, G, and B
    let add = amount*3 - lengthC; //Determine how many characters need to be added to reach the length needed
    if(color.length > add) //if the string is longer than the number of characters to be added (if length != 1, basically)
        color+=color.substring(0, add); //x is the number of characters to be added, takes x characters from the start of the string and adds them to the end.
    else { //if length == 1, basically
        for(let i = 0; i < add; i++) {
            color += color.substring(0,1); //adds the first charecter until you have enough charecters
        }
    }
    let red36 = color.substring(0, amount); //splits the string into 3 sections of equal length
    let green36 = color.substring(amount, amount*2);
    let blue36 = color.substring(amount*2, amount*3);
    if(red36 == '')
        red36 = '0';
    if(green36 =='')
        green36 = '0';
    if(blue36 == '')
        blue36 = '0';

    let LPData = LPGen.getLPs();
    let currentLang = '';
    let currentLangLength = 26;

    for (let markerIndex = 0; markerIndex < color.length; markerIndex++){
        let found = false;
        for (let lang in LPData) {
            if ((color.charCodeAt(markerIndex) >= LPData[lang].lower.from.charCodeAt(0) && color.charCodeAt(markerIndex) <= LPData[lang].lower.to.charCodeAt(0)) || 
        (color.charCodeAt(markerIndex) >= LPData[lang].upper.from.charCodeAt(0) && color.charCodeAt(markerIndex) <= LPData[lang].upper.to.charCodeAt(0))) {
                currentLang = lang;
                currentLangLength = LPData[lang].length;
                found = true;
                break;
            }
        }
        if (found) break;
    }


    
    let red = parse(red36, LPData, currentLang, currentLangLength); //Turns the numbers from base-36 to base-10 (decimal)
    let green = parse(green36, LPData, currentLang, currentLangLength);
    let blue = parse(blue36, LPData, currentLang, currentLangLength);
    // +10 for numbers
    let max = Math.pow(currentLangLength+10,amount)-1; // calculates the maximum possible value for a base-36 number of the length that each of the sections is
    if(max == 0)
        max = 1;
    let red16 = Math.round((red/max)*255).toString(16); //scales each value down to fit between 0 and 255, then converts them to base-16 (hexadecimal)
    let green16 = Math.round((green/max)*255).toString(16);
    let blue16 = Math.round((blue/max)*255).toString(16);
    if(red16.length < 2) //makes sure all 3 parts are 2 digits long
        red16 = "0" + red16;
    if(green16.length < 2)
        green16 = "0" + green16;
    if(blue16.length < 2)
        blue16 = "0" + blue16;
    let newColor = "#"+red16+green16+blue16; //creates the color
    return newColor; //returns the color
}