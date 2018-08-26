/* jshint esversion: 6 */
module.exports = {
    createButton: createButton,
    hexToRGB: hexToRGB,
    RGBtoHex: RGBtoHex,
    makeRGBDarker: makeRGBDarker,
    hoverColorMaker: hoverColorMaker
};

function createButton({value, buttonClass, buttonID, onclick, owner, style}) {
    if (!value) {
        return false;
    }
    let newButton = document.createElement('button');
    newButton.innerText = value;
    if (buttonClass) newButton.className = buttonClass;
    if (buttonID) newButton.id = buttonID;
    if (onclick) newButton.onclick = onclick;
    if (style)
    for (let key in Object.keys(style)) {
        newButton.style[key] = style[key];
    }
    if (owner) {
        owner.appendChild(newButton);
    }
    return newButton;
}

function hexToRGB(hex) {
    let res = [];
    for (let i = 0; i < Math.floor(hex.length/2); i++) {
        res.push(parseInt(hex.slice(i*2+1, i*2+3), 16));
    }
    return res;
}

function makeRGBDarker(RGB) {
    return RGB.map(c=>Math.floor(c*0.6));
}

function RGBtoHex(RGB) {
    let res = "#";
    for (let c of RGB) {
        c = c.toString(16);
        res += (c.length == 1?'0':'')+c;
    }
    return res;
}

function hoverColorMaker(color) {
    if (typeof(color) == 'string') {
        if (color[0] == '#') {
            return RGBtoHex(makeRGBDarker(hexToRGB(color)));
        }
    }
}