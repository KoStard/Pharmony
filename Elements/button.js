/* jshint esversion: 6 */
let colorFuncs = require('./../Colors/colorFuncs');
module.exports = {
    createButton: function ({
        value,
        buttonClass,
        buttonID,
        onclick,
        owner,
        style,
        darken = true,
        darkening = 0.4,
        saveIn,
    }) {
        let self = this;
        if (!value) {
            return false;
        }
        let newButton = document.createElement('button');
        newButton.innerText = value;
        if (buttonClass) newButton.className = buttonClass;
        if (buttonID) newButton.id = buttonID;
        if (onclick) newButton.onclick = onclick;
        if (style) {
            for (let key of Object.keys(style)) {
                newButton.style[key] = style[key];
            }
        }
        if (darken) {
            let backgroundColor;
            let backgroundHoverColor;
            let backgroundActiveColor;
            newButton.onmouseenter = function (e) {
                if (!backgroundColor) {
                    let real_style = window.getComputedStyle(newButton);
                    backgroundColor = real_style.backgroundColor;
                    backgroundHoverColor = colorFuncs.hoverColorMaker(backgroundColor, darkening);
                    backgroundActiveColor = colorFuncs.hoverColorMaker(backgroundColor, Math.min(1, darkening + 0.09));
                }
                this.style.backgroundColor = backgroundHoverColor;
            };
            newButton.onmousedown = function (e) {
                if (!backgroundColor) {
                    let real_style = window.getComputedStyle(newButton);
                    backgroundColor = real_style.backgroundColor;
                    backgroundHoverColor = colorFuncs.hoverColorMaker(backgroundColor, darkening);
                    backgroundActiveColor = colorFuncs.hoverColorMaker(backgroundColor, Math.min(1, darkening + 0.09));
                }
                this.style.backgroundColor = backgroundActiveColor;
            };
            newButton.onmouseup = function (e) {
                this.style.backgroundColor = backgroundHoverColor;
            };
            newButton.onmouseleave = function () {
                this.style.backgroundColor = backgroundColor;
            };
        }
        if (owner) {
            owner.appendChild(newButton);
        }
        if (saveIn) {
            saveIn.button = newButton;
        }
        return newButton;
    }
};