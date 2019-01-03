import React, { Component } from 'react';
import { connect } from 'react-redux';
import { removeCollectionActionCreator } from '../actions/collectionActions';
import { changePositionToCollectionActionCreator } from '../actions/positionActions';
import AddCollection from './AddCollection';
import SmallInput from './SmallPopup';

import './Menu.css';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.AddCollection_ref = React.createRef();
    this.RemoveCollectionPopup_ref = React.createRef();
  }
  openCollection = name => {
    this.props.changePositionToCollection(name);
  };
  handleAddCollectionButtonClick = event => {
    this.AddCollection_ref.current.activate();
  };
  render() {
    let collectionsDOM = this.props.collections.length ? (
      this.props.collections.map(collection => {
        return (
          <div
            key={collection.id}
            className="collection-card card-panel with-round-corners orange lighten-2 row hoverable"
          >
            <div className="col s6 collection-name-container">
              <div className="collection-name">
                <h3>{collection.name}</h3>
                <button
                  onClick={() => this.openCollection(collection.name)}
                  className="waves-effect waves-light btn"
                >
                  Open
                </button>
                <button
                  onClick={() =>
                    this.RemoveCollectionPopup_ref.current.activate({
                      collection: collection
                    })
                  }
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
      })
    ) : (
      <div className="center">
        <div
          className="waves-effect waves-teal btn-flat"
          onClick={() => {
            this.AddCollection_ref.current.activate();
          }}
        >
          There are no collections yet, add one.
        </div>
      </div>
    );
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
        <AddCollection ref={this.AddCollection_ref} />
        <SmallInput
          outputs={[
            {
              text: 'Are you sure, you want to remove this collection?',
              size: 'h5',
              key: 'message'
            }
          ]}
          buttons={[
            {
              name: 'Yes',
              id: 'small-popup-submit-button',
              className: 'waves-effect waves-light btn red',
              key: 'submit'
            },
            {
              name: 'No',
              id: 'small-popup-cancel-button',
              className: 'waves-effect waves-light btn grey',
              type: 'button',
              handleClick: '*cancel',
              key: 'cancel'
            }
          ]}
          handleSubmit={state => {
            this.props.removeCollection(state.params.collection.name);
          }}
          ref={this.RemoveCollectionPopup_ref}
        />
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
    removeCollection: removeCollectionActionCreator(dispatch),
    changePositionToCollection: changePositionToCollectionActionCreator(
      dispatch
    )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);
