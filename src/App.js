import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
const electron = window.require('electron');
const req = electron.remote.require;
const fs = req('fs');

class App extends Component {
  state = {
    data: ''
  };
  componentDidMount() {
    let data = fs.readFileSync('src/data.txt', 'utf-8');
    this.setState({
      data: data
    });
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React/Electron</h2>
        </div>
        <p>The data is: {this.state.data}</p>
      </div>
    );
  }
}

export default App;
