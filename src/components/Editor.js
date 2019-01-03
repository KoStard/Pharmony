import React, { Component } from 'react';
import './Editor.css';
import { CLIENT_RENEG_WINDOW } from 'tls';

class Editor extends Component {
  constructor(props) {
    super(props);
    this.editable_div = React.createRef();
  }
  activate() {}
  deactivate() {}
  handleSubmit = e => {
    e.preventDefault();
  };
  eraseEditableDiv() {
    let el = document.createElement('div');
    console.log('will be erased');
    el.appendChild(document.createTextNode('\u200B')); // zero width space -> remove them, when getting values
    this.editable_div.current.innerHTML = '';
    this.editable_div.current.appendChild(el);
  }
  handleEditableDivKeyUP = e => {
    console.log(this.editable_div.current.innerHTML);
    if (
      !this.editable_div.current.innerText ||
      this.editable_div.current.innerHTML == '<div>​</div>' || // these symbols are not same as <div></div>, so to get same result, use them
      this.editable_div.current.innerHTML == '<br>'
    ) {
      this.eraseEditableDiv();
    } else {
      for (let child of this.editable_div.current.children) {
        // Will remove zero width space when the element is not focused
        if (
          ~child.innerText.indexOf('\u200B') &&
          document.getSelection().anchorNode.parentNode != child
        )
          child.innerText = child.innerText.replace('\u200B', '');
      }
    }
  };
  handleEditableDivChange = e => {
    console.log('Changed');
  };
  render() {
    return (
      <div id="editor-container" className="active">
        <div id="editor">
          <form onSubmit={this.handleSubmit}>
            <input type="text" id="editor-block-name-input" />
            <div id="editor-description-div-location">
              <div
                id="editor-description-div-container"
                onClick={e => {
                  if (e.target.id == 'editor-description-div-container') {
                    this.editable_div.current.focus();
                    let s = window.getSelection();
                    let r = document.createRange();
                    r.setStart(
                      this.editable_div.current,
                      this.editable_div.current.childNodes.length
                    );
                    r.setEnd(
                      this.editable_div.current,
                      this.editable_div.current.childNodes.length
                    );
                    s.removeAllRanges();
                    s.addRange(r);
                  }
                }}
              >
                <div
                  contentEditable="true"
                  ref={this.editable_div}
                  onKeyUp={this.handleEditableDivKeyUP}
                  onInput={this.handleEditableDivChange}
                />
              </div>
            </div>
            <div className="button-container">
              <button
                type="submit"
                className="waves-effect waves-dark btn orange"
              >
                Done
              </button>
              <button
                type="reset"
                className="waves-effect waves-dark btn orange"
              >
                Erase
              </button>
              <button
                type="button"
                className="waves-effect waves-dark btn orange"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Editor;
