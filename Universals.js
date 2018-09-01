/* jshint esversion: 6 */
module.exports = {
    createButton: createButton
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