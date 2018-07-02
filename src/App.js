import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Orderbook from './components/Orderbook';

class App extends Component {
  render() {
    return (
      <div className="App container mt-5">
        <Orderbook/>
      </div>
    );
  }
}

export default App;
