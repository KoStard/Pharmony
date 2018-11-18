/* jshint esversion: 6 */

module.exports = {
    createResponsiveFunction: createResponsiveFunction,
    PopupAlertPanelSmall: PopupAlertPanelSmall,
    PopupInputPanelBigCentral: PopupInputPanelBigCentral,
    runningPopup: () => {
        return runningPopup;
    },
    removeRunningPopup: () => {
        runningPopup.close();
        runningPopup = undefined;
    },
    init: init
};

const cc = require('./contentCreator');

let globals;
let runningPopup;

function createResponsiveFunction({
    func,
    popupAlertPanel,
    startInfo,
    successInfo,
    successLogic,
    errorInfo
}) {
    return (attrs) => {
        if (startInfo) {
            new popupAlertPanel(startInfo);
        }
        try {
            let successLogicResp = (successLogic ? successLogic(attrs) : true);
            if (func(attrs) === false) throw false;
            if (successInfo && successLogicResp) new popupAlertPanel(successInfo);
        } catch (err) {
            if (errorInfo == 'error') {
                new popupAlertPanel({
                    text: err
                });
            } else if (errorInfo) {
                new popupAlertPanel(errorInfo);
            }
        }
    };
}

function PopupAlertPanelSmall({
    text,
    color,
    icon,
    parent,
    delay,
    onclick
}) {
    if (!parent) parent = document.body;
    if (!delay) delay = 2000;
    let oldPanels = document.getElementsByClassName('popupAlertPanelSmall');
    for (let oldPanel of oldPanels) {
        oldPanel.remove();
    }
    let panel = document.createElement('div');
    panel.className = 'popupAlertPanelSmall';
    panel.innerHTML = `<p>${text}</p>`;
    if (color) panel.style.backgroundColor = color;
    if (onclick) {
        panel.onclick = onclick;
        panel.style.cursor = 'pointer';
    }
    parent.appendChild(panel);
    this.panel = panel;
    setTimeout(() => {
        panel.remove();
    }, delay);
}

function PopupBigPanelCentral({
    owner,
    onclose,
    buffered,
    element,
}) {
    this.onclose = onclose;
    let panelHolder = document.createElement('div');
    panelHolder.className = 'popupBigPanelCentralHolder';

    let backgroundCover = document.createElement('div');
    backgroundCover.className = 'backgroundCover';
    panelHolder.appendChild(backgroundCover);

    let panel = document.createElement('div');
    panel.className = 'popupBigPanelCentral';
    panelHolder.appendChild(panel);

    owner.appendChild(panelHolder);

    this.panelHolder = panelHolder;
    this.panel = panel;
    if (buffered) {
        this.hide = () => {
            if (this.onclose) this.onclose();
            runningPopup = undefined;
            this.panelHolder.style.display = "none";
        };
        this.panelHolder.style.display = 'block';
    } else {
        this.exit = () => {
            if (this.onclose) this.onclose();
            runningPopup = undefined;
            this.panelHolder.remove();
        };
    }
    backgroundCover.onclick = () => {
        element.close();
    };
}

function PopupInputPanelBigCentral({
    headerText,
    contentModel,
    owner,
    buffered = false,
    initialState,
    finishFunction,
    onclose,
    openingFunction,
}) {
    this.args = arguments[0];
    this.openingFunction = openingFunction;

    this.popupBigPanelCentral = new PopupBigPanelCentral({
        owner: owner,
        buffered: buffered,
        element: this,
    });
    this.panelHolder = this.popupBigPanelCentral.panelHolder;
    this.panelHolder.classList.add('popupInputPanelBigCentral');
    let panel = this.popupBigPanelCentral.panel;
    this.panel = panel;

    let header = createPopupElement('div', ['text', 'header']);
    header.innerText = headerText;
    panel.appendChild(header);

    for (let current of contentModel) {
        if (current.nodeType) {
            current.classList.add(popupClassNames.standart);
            if (popupClassNames[current.tagName.toLowerCase()])
                current.classList.add(popupClassNames[current.tagName.toLowerCase()]);
        } else {
            if (!current.args.classList) current.args.classList = [];
            current.args.classList.push(popupClassNames.standart); // Adding ability to give initial classList from the view.js
            if (popupClassNames[current.type])
                current.args.classList.push(popupClassNames[current.type]);
        }
    }

    let content = cc(contentModel, panel);
    this.inputs = content.filter((el) => el.tagName == 'INPUT' || el.tagName == 'TEXTAREA' || (el.tagName == 'DIV' && el.getAttribute('contenteditable')));
    this.buttons = content.filter((el) => el.tagName == 'BUTTON');

    this.getInputValue = (index) => {
        let input = this.inputs[index];
        if (input.tagName == 'DIV' && input.getAttribute('contenteditable')) {
            return input.innerText;
        } else {
            return input.value;
        }
    };

    this.setInputValue = (index, value) => {
        let input = this.inputs[index];
        if (input.tagName == 'DIV' && input.getAttribute('contenteditable')) {
            input.focus();
            document.execCommand('selectAll', false);
            document.execCommand('insertText', false, value);
        } else {
            input.value = value;
        }
    };

    this.insertInputValue = (index, value) => {
        let input = this.inputs[index];
        if (input.tagName == 'DIV' && input.getAttribute('contenteditable')) {
            input.focus();
            document.execCommand('insertText', false, value);
        } else {
            input.value += value;
        }
    };

    for (let button of this.buttons) {
        let tempFunc = button.onclick;
        button.onclick = () => {
            tempFunc(this);
        };
    }

    if (onclose) this.popupBigPanelCentral.onclose = () => {
        onclose(this);
    };

    this.focus = () => {
        if (this.inputs.length > 0) {
            this.inputs[0].focus();
        } else if (this.buttons.length > 0) {
            this.buttons[0].focus();
        }
    };

    if (buffered) {
        this.show = () => {
            globals && globals.capturingObjects.push(this);
            runningPopup = this;
            this.panelHolder.style.display = "block";
            if (this.openingFunction) this.openingFunction(this);
            this.focus();
        };
        this.hide = () => {
            this.popupBigPanelCentral.hide();
        };
    } else {
        if (initialState != "hidden") {
            this.panelHolder.style.display = "block";
            globals && globals.capturingObjects.push(this);
            this.focus();
            runningPopup = this;
        }
    }

    this.exit = () => {
        this.popupBigPanelCentral.exit();
    };

    this.close = () => {
        globals && globals.capturingObjects.pop(this);
        if (this.hide) this.hide();
        else this.exit();
    };

    if (initialState == "hidden") {
        this.hide();
    }

    if (finishFunction) finishFunction(this);
    return this;
}
let popupClassNames = {
    standart: 'popup-standart',
    textarea: 'popup-textarea',
    input: 'popup-input',
    button: 'popup-button',
    header: 'popup-header',
    text: 'popup-text',
    inputFile: 'popup-inputFile',
    editable_div: 'popup-editable_div',
};

function createPopupElement(name, mode) {
    let tempElem = document.createElement(name);
    if (!mode) mode = [popupClassNames.standart];
    tempElem.classList.add(...mode.map((x) => {
        if (popupClassNames[x]) return popupClassNames[x];
    }));
    return tempElem;
}

function makePopupElement(elem, mode) {
    if (!mode) mode = [popupClassNames.standart];
    for (let curr of mode) {
        if (!popupClassNames[curr]) continue;
        curr = popupClassNames[curr];
        if (!elem.classList.contains(curr)) elem.classList.add(curr);
    }
    return elem;
}

function init(glbs) {
    globals = glbs;
}