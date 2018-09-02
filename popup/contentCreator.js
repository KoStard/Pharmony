/* jshint esversion: 6 */

module.exports = processContentCreator;

const available = Object.freeze({
    __default__: {
        classList: function(cl){
            for (let className of cl){
                this.classList.add(className);
            }
        },
        create: function (owner, tp){
            let el = document.createElement(tp);
            if (owner)
                owner.appendChild(el);
            return el;
        },
    },
    label: {
        text: function(text){
            this.innerText = text;
        },
    },
    input: {
        type: function(tp){
            this.setAttribute('type', tp);
        },
        placeholder: function(placeholder){
            this.setAttribute('placeholder', placeholder);
        },
        value: function(val){
            this.setAttribute('value', val);
        }
    },
    textarea: {
        placeholder: function (placeholder) {
            this.setAttribute('placeholder', placeholder);
        },
    },
    button: {
        text: function (text) {
            this.innerText = text;
        },
    }
});

function processContentCreator(ContentModel, owner){ // do not use one big object! Use array
/**
 * 
 * [
 *  {
 *      type: 'input',
 *      args: {
 *          name: value
 *      }
 *  }
 * ]
 * 
 */
    let res = [];
    for (let current of ContentModel) {
        if (current.nodeType){
            res.push(current);
            owner.appendChild(current);
            continue;
        }
        let el = available.__default__.create(owner, current.type);
        res.push(el);
        for (let arg in current.args){
            if (available.__default__[arg])
                available.__default__[arg].call(el, current.args[arg]);
            else if (available[current.type][arg])
                available[current.type][arg].call(el, current.args[arg]);
            else console.log(`Invalid arg ${arg} for element ${current.type}`);
        }
    }
    return res;
}