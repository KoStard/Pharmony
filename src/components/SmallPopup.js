import React, { Component } from 'react';
import './SmallPopup.css';
import { PassThrough } from 'stream';

/**
 * Creating universal small-popup -> will not contain any specific methods in it
 * outputs -> [{text: "", size: "h1/h2/...", key=""}]
 * inputs -> their label names [{name: text, id: text}...]
 * buttons -> with their types [{name: text, id: text, type: text: handleClick: ?function}...]
 * handleSubmit
 */
class SmallPopup extends Component {
  constructor(props) {
    super(props);
    this.container_ref = React.createRef();
  }
  state = {
    params: []
  };
  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    // Add checking, if all important fields are filled
    this.props.handleSubmit({ ...this.state });
    this.close();
  };
  activate = params => {
    this.container_ref.current.classList.add('active');
    this.setState({ params: params });
  };
  close = e => {
    this.container_ref.current.classList.remove('active');
    let new_state = { ...this.state };
    for (let key of Object.keys(new_state)) {
      new_state[key] = null;
    }
    this.setState(new_state);
  };
  render() {
    let outputsList = this.props.outputs
      ? this.props.outputs.map(outputData => {
          const SelectedTag = outputData.size || 'p';
          return (
            <SelectedTag key={outputData.key || outputData.text}>
              {outputData.text}
            </SelectedTag>
          );
        })
      : null;
    let inputsList = (this.props.inputs || []).map(inputData => {
      return (
        <div className="input-field" key={inputData.id}>
          <input
            type="text"
            id={inputData.id}
            onChange={this.handleChange}
            name={inputData.name}
          />
          <label htmlFor={inputData.id}>{inputData.name}</label>
        </div>
      );
    });
    let buttonsList = (this.props.buttons || []).map(buttonData => {
      return (
        <button
          type={buttonData.type || 'submit'} // maybe || "button"
          onClick={e => {
            if (typeof buttonData.handleClick == 'string') {
              // always starting with *
              switch (buttonData.handleClick) {
                case '*cancel':
                  this.close();
                  break;
              }
            } else if (buttonData.handleClick) {
              buttonData.handleClick(e);
            }
          }}
          key={buttonData.id}
          className={
            buttonData.className !== undefined
              ? buttonData.className
              : 'waves-effect waves-light btn'
          }
        >
          {buttonData.name}
        </button>
      );
    });
    return (
      <div
        className="small-popup"
        ref={this.container_ref}
        onClick={this.close}
      >
        <div className="small-popup-content white with-round-corners">
          <form onSubmit={this.handleSubmit}>
            {outputsList}
            {inputsList}
            {buttonsList}
          </form>
        </div>
      </div>
    );
  }
}

export default SmallPopup;
