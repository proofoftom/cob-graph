import React, {Component} from 'react'
import Buybook from './Buybook';
import Sellbook from './Sellbook';

export default class Orderbook extends Component {
  render() {
    return (
      <div className="row">
        <Buybook/>
        <Sellbook/>
      </div>
    )
  }
}
