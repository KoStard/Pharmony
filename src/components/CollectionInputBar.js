import React, { Component } from 'react';
import './CollectionInputBar.css';

class CollectionInputBar extends Component {
  constructor(props) {
    super(props);
    this.inputBar = React.createRef();
  }
  state = {
    value: '',
    condition: 'empty'
  };
  handleChange = e => {
    this.setState({
      value: e.target.value
    });
    this.checkEntity();
  };
  createOrEditBlocks = (name, value) => {};
  removeBlocks = (name, value) => {};
  renameBlocks = (name, value) => {};
  addToBlocks = (name, value) => {};
  removeFromBlocks = (name, value) => {};
  searchHandler = name => {};
  keys = {
    '--': this.createOrEditBlocks,
    '--/': this.removeBlocks,
    '-->': this.renameBlocks,
    '--+': this.addToBlocks,
    '---': this.removeFromBlocks
  };
  standardizationReplacements = {
    '': ['^\\s+', '\\s+$', '\\s+(?=--)'],
    ';': ['(?:;\\s*){2,}', '\\s*;\\s*', ';\\n', ';\\r', '\\n', '\\r'],
    ' ': ['\\s{2,}']
  };
  standardizeText(text) {
    if (!text) return text;
    for (let symb in this.standardizationReplacements) {
      text = text.replace(
        new RegExp(
          this.standardizationReplacements[symb].map(x => `(${x})`).join('|'),
          'g'
        ),
        symb
      );
    }
    return text;
  }
  getContent() {
    let value = this.standardizeText(this.inputBar.current.value);
    let keys = value.match(/--/g);
    if (!keys) {
      return [null, value];
    } else if (keys.length == 1) {
      return value.match(/^\s*(.+[^-])(--(?:[>\/+-]|))\s*(.*)\s*$/);
    }
  }
  processEntity() {
    if (~this.inputBar.current.value.indexOf('--')) {
      let [m, name, key, description] = this.getContent() || [];
      if (m) {
        this.keys[key](name, description);
      } else {
        console.log(`Invalid input ${this.inputBar.current.value}`);
      }
    } else {
      this.searchHandler(this.inputBar.current.value);
    }
  }
  checkEntity() {
    let new_condition = 'valid';
    if ((this.inputBar.current.value.match(/--/g) || []).length > 1) {
      new_condition = 'invalid';
    } else {
      let [m, name] = this.getContent();
      if (!name) {
        new_condition = 'empty';
      } else if (
        this.props.collection.blocks.find(block => block.name == name)
      ) {
        new_condition = 'already-created';
      }
    }
    this.setState({
      condition: new_condition
    });
  }
  handleSubmit = e => {
    e.preventDefault();
    this.processEntity();
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          id="collection-input-bar"
          onChange={this.handleChange}
          className={(() => {
            switch (this.state.condition) {
              case 'invalid':
                return 'invalid';
              case 'already-created':
                return 'already-created';
            }
          })()}
          ref={this.inputBar}
        />
      </form>
    );
  }
}

export default CollectionInputBar;
