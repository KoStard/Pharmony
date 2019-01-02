import React, { Component } from 'react';
import Menu from './components/Menu';
const electron = window.require('electron');
const req = electron.remote.require;

class App extends Component {
  render() {
    return (
      <div className="App">
        <Menu />
      </div>
    );
  }
}

export default App;
