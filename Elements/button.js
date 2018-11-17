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
            newButton.onmouseenter = function (e) {
                if (!backgroundColor) {
                    let real_style = window.getComputedStyle(newButton);
                    backgroundColor = real_style.backgroundColor;
                }
                this.style.backgroundColor = colorFuncs.hoverColorMaker(backgroundColor, darkening);
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