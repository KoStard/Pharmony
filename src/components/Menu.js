import React, { Component } from 'react';
import { connect } from 'react-redux';
import { removeCollectionActionCreator } from '../actions/collectionActions';
import AddCollection from './AddCollection';

import './Menu.css';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.AddCollection_child = React.createRef();
  }
  openCollection = name => {
    console.log(`Has to open collection ${name}`);
  };
  handleAddCollectionButtonClick = event => {
    this.AddCollection_child.current.activate();
  };
  render() {
    let collectionsDOM = this.props.collections.map(collection => {
      return (
        <div
          key={collection.id}
          className="collection-card card-panel orange lighten-2 row hoverable"
        >
          <div className="col s6 collection-name-container">
            <div className="collection-name">
              <h3 className="truncate">{collection.name}</h3>
              <button
                onClick={() => this.openCollection(collection.name)}
                className="waves-effect waves-light btn"
              >
                Open
              </button>
              <button
                onClick={() => this.props.removeCollection(collection.name)}
                className="waves-effect waves-light btn red"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="col s6 collection-description orange lighten-5 valign-wrapper">
            <p>{collection.description}</p>
          </div>
        </div>
      );
    });
    return (
      <div className="container menu-container">
        {collectionsDOM}
        <button
          id="add-collection-button"
          className="waves-effect waves-dark btn orange"
          onClick={() => {
            this.handleAddCollectionButtonClick();
          }}
        >
          +
        </button>
        <AddCollection ref={this.AddCollection_child} />
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
    removeCollection: removeCollectionActionCreator(dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);
