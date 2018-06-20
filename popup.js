/* jshint esversion: 6 */

module.exports = {
    createResponsiveFunction: createResponsiveFunction,
    popupAlertPanelSmall: popupAlertPanelSmall,
    PopupInputPanelBigCentral: PopupInputPanelBigCentral,
    runningPopup: () => { return runningPopup; },
    removeRunningPopup: () => { runningPopup.panelHolder.remove(); runningPopup=undefined; }
};
let runningPopup;
function createResponsiveFunction({func, popupAlertPanel, startInfo, successInfo, errorInfo}) {
    return (attrs)=>{
        if (startInfo) {
            new popupAlertPanel(startInfo);
        }
        try{
            if (func(attrs) === false) throw false;
            if (successInfo) new popupAlertPanel(successInfo);
        } catch (err) {
            if (errorInfo == 'error') {
                new popupAlertPanel({text:err});
            }else if (errorInfo) {
                new popupAlertPanel(errorInfo);
            }
        }
    };
}

function popupAlertPanelSmall({ text, color, icon, parent, delay, onclick }) {
    if (!parent) parent = document.body;
    if (!delay) delay = 2000;
    if (!color) color = '#fff';
    let oldPanels = document.getElementsByClassName('popupAlertPanelSmall');
    for (let oldPanel of oldPanels) {
        oldPanel.remove();
    }
    let panel = document.createElement('div');
    panel.className = 'popupAlertPanelSmall';
    panel.innerHTML = `<p>${text}</p>`;
    panel.style.backgroundColor = color;
    if (onclick) {panel.onclick = onclick; panel.style.cursor = 'pointer';}
    parent.appendChild(panel);
    this.panel = panel;
    setTimeout(()=>{
        panel.remove();
    }, delay);
    return this;
}

function PopupBigPanelCentral(owner) {
    let panelHolder = document.createElement('div');
    panelHolder.className = 'popupBigPanelCentralHolder';

    let backgroundCover = document.createElement('div');
    backgroundCover.className = 'backgroundCover';
    backgroundCover.onclick = function(){
        runningPopup = undefined;
        panelHolder.remove();
    };
    panelHolder.appendChild(backgroundCover);

    let panel = document.createElement('div');
    panel.className = 'popupBigPanelCentral';
    panelHolder.appendChild(panel);

    owner.appendChild(panelHolder);

    this.panelHolder = panelHolder;
    this.panel = panel;
}

function PopupInputPanelBigCentral({headerText, inputNames, finishFunction, buttons, owner}){
    this.args = arguments[0];

    let popupBigPanelCentral = new PopupBigPanelCentral(owner);
    let panel = popupBigPanelCentral.panel;
    this.panelHolder = popupBigPanelCentral.panelHolder;
    this.panelHolder.classList.add('popupInputPanelBigCentral');
    
    let header = createPopupElement('div', ['text', 'header']);
    header.innerText = headerText;
    panel.appendChild(header);

    this.inputs = [];
    for (let inputName of inputNames) {
        let name = inputName.match(/^\*text([\s\S]+)/);
        if (name){
            name = name[1];
            let textarea = createPopupElement('textarea', ['standart', 'textarea']);
            textarea.setAttribute('placeholder', name);
            this.inputs.push(textarea);
            panel.appendChild(textarea);
        }else {
            let inp = createPopupElement('input', ['standart', 'input']);
            inp.type = 'text';
            inp.setAttribute('placeholder', inputName);
            this.inputs.push(inp);
            panel.appendChild(inp);
        }
    }

    for(let button of buttons) {
        button = makePopupElement(button, ['standart', 'button']);
        let tempFunc = button.onclick;
        button.onclick = ()=>{tempFunc(this);};
        panel.appendChild(button);
    }

    this.panel = panel;

    finishFunction && finishFunction(this);
    runningPopup = this;
    return this;
}
let popupClassNames = {
    standart: 'popup-standart',
    textarea: 'popup-textarea',
    input: 'popup-input',
    button: 'popup-button',
    header: 'popup-header',
    text: 'popup-text'
};
function createPopupElement(name, mode) {
    let tempElem = document.createElement(name);
    if (!mode) mode = [popupClassNames.standart];
    tempElem.classList.add(...mode.map((x)=>{if (popupClassNames[x]) return popupClassNames[x];}));
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