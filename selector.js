/* jshint esversion: 6 */

module.exports = Selector;

function Selector({elements, selectedColor = '#D62839', unselectedColor = 'rgb(178, 192, 199)',
hoverColor, }) {
    this.elements = elements;
    this.selectedColor = selectedColor;
    this.hoverColor = hoverColor;
    if (unselectedColor == 'none') unselectedColor = '';
    this.unselectedColor = unselectedColor;
    this.tempElementsInfo = [];
    this.selectedElements = [];
    this.push = (elementIndex)=>{
        let element = elements[elementIndex];
        this.tempElementsInfo.push({
            onclick: element.onclick,
            onmouseenter: element.onmouseenter,
            onmouseleave: element.onmouseleave,
            background: element.style.background
        });
        element.classList.add('selectorElement');
        element.style.background = unselectedColor || this.tempElementsInfo[elementIndex].background;
        element.onclick = () => {
            if (element.classList.contains('selected')) {
                element.classList.remove('selected');
                element.style.background = unselectedColor || this.tempElementsInfo[elementIndex].background;
                this.removeFromSelectedElements(element);
            } else {
                element.classList.add('selected');
                element.style.background = selectedColor;
                this.addToSelectedElements(element);
            }
        };
        element.onmouseenter = () => {
            if (!element.classList.contains('selected')) {
                element.style.background = hoverColor;
            }
        };
        element.onmouseleave = () => {
            if (!element.classList.contains('selected'))
                element.style.background = unselectedColor || this.tempElementsInfo[elementIndex].background;
        };
    }
    this.start = () => {
        this.globals && this.globals.capturingObjects.push(this);
        for (let elementIndex in elements) {
            this.push(elementIndex);
        }
    };
    this.selectElement = (element) => {
        if (this.elements.includes(element)) {
            element.classList.add('selected');
            element.style.background = selectedColor;
            this.addToSelectedElements(element);
        }
    }
    this.deselectElement = (element) => {
        if (this.elements.includes(element)) {
            if (element.classList.contains('selected')) {
                element.classList.remove('selected');
                element.style.background = unselectedColor || this.tempElementsInfo[elementIndex].background;
                this.removeFromSelectedElements(element);
            }
        }
    }
    this.addToSelectedElements = (element)=>{ // Element has to be from the elements list
        this.selectedElements.push(element);
    };
    this.removeFromSelectedElements = (element) => {
        this.selectedElements.pop(element);
    };
    this.pop = (elementID) => {
        let element = elements[elementID];
        element.onclick = this.tempElementsInfo[elementID].onclick;
        element.style.background = this.tempElementsInfo[elementID].background;
        element.classList.remove('selectorElement', 'selected');
        element.onmouseenter = this.tempElementsInfo[elementID].onmouseenter;
        element.onmouseleave = this.tempElementsInfo[elementID].onmouseleave;
    }
    this.stop = () => {
        this.globals && this.globals.capturingObjects.pop(this);
        for (let elementID in elements) {
            this.pop(elementID);
        }
    };
    this.close = this.stop;
    this.init = (globals)=>{this.globals = globals;};
}