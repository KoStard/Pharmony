/* jshint esversion: 6 */

module.exports = {
    hoverColorMaker: hoverColorMaker,
    getOppositeColor: getOppositeColor,
    getWhiteOrBlackMaxContrast: getWhiteOrBlackMaxContrast
};

function hexToRGB(hex) {
    let res = [];
    for (let i = 0; i < Math.floor(hex.length / 2); i++) {
        res.push(parseInt(hex.slice(i * 2 + 1, i * 2 + 3), 16));
    }
    return res;
}

function makeRGBDarker(RGB) {
    return RGB.map(c => Math.floor(c * 0.6));
}

function RGBtoHex(RGB) {
    let res = "#";
    for (let c of RGB) {
        c = c.toString(16);
        res += (c.length == 1 ? '0' : '') + c;
    }
    return res;
}

function hoverColorMaker(color) {
    if (typeof (color) == 'string') {
        if (color[0] == '#') {
            return RGBtoHex(makeRGBDarker(hexToRGB(color)));
        } else if (color.slice(0, 3) == 'rgb') {
            let rgb = RGBTextToRGB(color);
            return RGBtoHex(makeRGBDarker(rgb));
        }
    }
}

function getOppositeColor(color) {
    if (typeof (color) == 'string') {
        if (color[0] == '#') {
            return RGBtoHex(hexToRGB(color).map(c=>255-c));
        } else if (color.slice(0, 3) == 'rgb') {
            let rgb = RGBTextToRGB(color);
            return RGBtoHex(rgb.map(c => 255 - c));
        }
    }
}

function RGBTextToRGB(color) {
    color = color.slice(4, color.length-1);
    color = color.split(/,\s*/);
    let res = [];
    for (let p of color){
        res.push(parseInt(p));
    }
    return res;
}

function sum (){
    let res = 0;
    for (let arg of arguments){
        if (typeof(arg) == 'object'){
            for (let sub of arg){
                if (typeof (sub) == 'number') {
                    res += sub;
                } else if (typeof (sub) == 'string') {
                    let n = parseInt(sub);
                    if (n)
                        res += n;
                }
            }
        }else {
            if (typeof(arg) == 'number'){
                res += arg;
            } else if (typeof(arg) == 'string'){
                let n = parseInt(arg);
                if (n)
                    res += n;
            }
        }
    }
    return res;
};
function getWhiteOrBlackMaxContrast(color){
    if (typeof (color) == 'string') {
        if (color[0] == '#') {
            let dw = sum(hexToRGB(color).map(x=>255-x));
            let db = sum(hexToRGB(color));
            console.log(dw, db);
            return dw > db ? '#ffffff' : '#000000';
        } else  if (color.slice(0, 3) == 'rgb') {
            let rgb = RGBTextToRGB(color);
            let dw = sum(rgb.map(x => 255 - x));
            let db = sum(rgb);
            return dw > db ? '#ffffff' : '#000000';
        }
    }
}