/* jshint esversion: 6 */

module.exports = {
    hexToRGB: function (hex) {
        let res = [];
        for (let i = 0; i < Math.floor(hex.length / 2); i++) {
            res.push(parseInt(hex.slice(i * 2 + 1, i * 2 + 3), 16));
        }
        return res;
    },

    makeRGBDarker: function (RGB, darkening) {
        if (!darkening) darkening = 0.4;
        return RGB.map(c => Math.floor(c * (1 - darkening)));
    },

    RGBtoHex: function (RGB) {
        let res = "#";
        for (let c of RGB) {
            c = c.toString(16);
            res += (c.length == 1 ? '0' : '') + c;
        }
        return res;
    },

    hoverColorMaker: function (color, darkening) {
        if (!darkening) darkening = 0.4;
        if (typeof (color) == 'string') {
            if (color[0] == '#') {
                return module.exports.RGBtoHex(module.exports.makeRGBDarker(module.exports.hexToRGB(color), darkening));
            } else if (color.slice(0, 3) == 'rgb') {
                let rgb = module.exports.RGBTextToRGB(color);
                return module.exports.RGBtoHex(module.exports.makeRGBDarker(rgb, darkening));
            }
        }
    },

    getOppositeColor: function (color) {
        if (typeof (color) == 'string') {
            if (color[0] == '#') {
                return module.exports.RGBtoHex(hexToRGB(color).map(c => 255 - c));
            } else if (color.slice(0, 3) == 'rgb') {
                let rgb = module.exports.RGBTextToRGB(color);
                return module.exports.RGBtoHex(rgb.map(c => 255 - c));
            }
        }
    },

    textToRGB: function (text) {
        if (!text) return null;
        if (text[0] == '#') {
            return module.exports.hexToRGB(text);
        } else {
            return module.exports.module.exports.RGBTextToRGB(text);
        }
    },

    RGBTextToRGB: function (color) {
        color = color.slice(4, color.length - 1);
        color = color.split(/,\s*/);
        let res = [];
        for (let p of color) {
            res.push(parseInt(p));
        }
        return res;
    },

    RGBToText: function (RGB) {
        return `rgb(${RGB.join(', ')})`;
    },

    sum: function () {
        let res = 0;
        for (let arg of arguments) {
            if (typeof (arg) == 'object') {
                for (let sub of arg) {
                    if (typeof (sub) == 'number') {
                        res += sub;
                    } else if (typeof (sub) == 'string') {
                        let n = parseInt(sub);
                        if (n)
                            res += n;
                    }
                }
            } else {
                if (typeof (arg) == 'number') {
                    res += arg;
                } else if (typeof (arg) == 'string') {
                    let n = parseInt(arg);
                    if (n)
                        res += n;
                }
            }
        }
        return res;
    },
    getWhiteOrBlackMaxContrast: function (color) {
        if (typeof (color) == 'string') {
            if (color[0] == '#') {
                let dw = module.exports.sum(module.exports.hexToRGB(color).map(x => 255 - x));
                let db = module.exports.sum(module.exports.hexToRGB(color));
                console.log(dw, db);
                return dw > db ? '#ffffff' : '#000000';
            } else if (color.slice(0, 3) == 'rgb') {
                let rgb = module.exports.RGBTextToRGB(color);
                let dw = module.exports.sum(rgb.map(x => 255 - x));
                let db = module.exports.sum(rgb);
                return dw > db ? '#ffffff' : '#000000';
            }
        }
    },
};