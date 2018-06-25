/* jshint esversion: 6 */

module.exports = Selector;

function Selector({elements, selectedColor = '#D62839', unselectedColor = '#CCE6F4'}) {
    this.elements = elements;
    this.selectedColor = selectedColor;
    this.unselectedColor = unselectedColor;
    this.tempElementsInfo = [];
    this.selectedElements = [];
    this.start = () => {
        for (let element of elements) {
            this.tempElementsInfo.push({
                onclick: element.onclick,
                background: element.style.background
            });
            element.classList.add('selectorElement');
            element.style.background = unselectedColor;
            element.onclick = () => {
                if (element.classList.contains('selected')) {element.classList.remove('selected');element.style.background = unselectedColor; this.removeFromSelectedElements(element);}
                else {element.classList.add('selected');element.style.background = selectedColor; this.addToSelectedElements(element);}
            };
        }
    };
    this.addToSelectedElements = (element)=>{
        this.selectedElements.push(element);
    };
    this.removeFromSelectedElements = (element)=>{
        this.selectedElements.pop(element);
    };
    this.stop = () => {
        for (let elementID in elements) {
            let element = elements[elementID];
            element.onclick = this.tempElementsInfo[elementID].onclick;
            element.style.background = this.tempElementsInfo[elementID].background;
            element.classList.remove('selectorElement', 'selected');
        }
    };
}