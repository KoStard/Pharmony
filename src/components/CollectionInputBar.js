import React, { Component } from 'react';

class CollectionInputBar extends Component {
  state = {
    value: ''
  };
  handleChange = e => {
    this.setState({
      value: e.target.value
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.handleSubmit(this.state.value);
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          id="collection-input-bar"
          onChange={this.handleChange}
        />
      </form>
    );
  }
}

export default CollectionInputBar;
