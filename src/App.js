import React, { Component } from 'react';
import Menu from './components/Menu';
import Collection from './components/Collection';
import { connect } from 'react-redux';
const electron = window.require('electron');
const req = electron.remote.require;

class App extends Component {
  render() {
    return (
      <div className="App">
        {(() => {
          switch (this.props.currentPosition.position) {
            case 'COLLECTION':
              return (
                <Collection
                  collection={this.props.collections.find(
                    collection =>
                      collection.name ==
                      this.props.currentPosition.additional.collection_name
                  )}
                />
              );
            case 'MENU':
            default:
              return <Menu />;
          }
        })()}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    collections: state.collections,
    currentPosition: state.currentPosition
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
