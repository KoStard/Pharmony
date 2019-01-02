import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createCollectionActionCreator } from '../actions/collectionActions';

import './AddCollection.css';

class AddCollection extends Component {
  constructor(props) {
    super(props);
    this.container_ref = React.createRef();
  }
  state = {
    name: '',
    description: ''
  };
  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.name) return;
    this.props.createCollection(this.state.name, this.state.description);
    this.container_ref.current.firstChild.reset();
    this.setState({
      name: '',
      description: ''
    });
    this.deactivate();
  };
  activate = () => {
    this.container_ref.current.classList.add('active');
  };
  deactivate = () => {
    this.container_ref.current.classList.remove('active');
  };
  handleChange = e => {
    this.setState({
      [e.target.id.split('-').pop()]: e.target.value
    });
  };
  render() {
    return (
      <div
        id="add-collection-container"
        className="green lighten-5"
        ref={this.container_ref}
      >
        <form
          onSubmit={this.handleSubmit}
          id="add-collection-form"
          className=""
        >
          <div className="input-field">
            <input
              type="text"
              id="new-collection-name"
              onChange={this.handleChange}
            />
            <label htmlFor="new-collection-name">Name: </label>
          </div>
          <div className="input-field">
            <input
              type="text"
              id="new-collection-description"
              onChange={this.handleChange}
            />
            <label htmlFor="new-collection-description">Description: </label>
          </div>
          <button
            type="submit"
            className="waves-effect waves-dark btn-flat green lighten-3"
          >
            Create
          </button>
          <button
            type="button"
            className="waves-effect waves-dark btn-flat grey lighten-1"
            onClick={this.deactivate}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    collections: state.collections
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createCollection: createCollectionActionCreator(dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(AddCollection);
