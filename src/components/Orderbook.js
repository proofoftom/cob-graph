import React, {Component} from 'react';
import * as d3 from 'd3';
import drawOrderbook from '@melonproject/orderbook-visualisation';

class Orderbook extends Component {

  exchanges = [
    {
      id: 'bittrex',
      url: 'https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-ETH&type=both'
    }, {
      id: 'poloniex',
      url: 'https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=100'
    }
  ];

  constructor() {
    super();

    this.state = {
      orderbooks: {}
    };

  }

  componentDidMount() {
    this
      .exchanges
      .forEach(exchange => {
        this
          .getOrderbook(exchange)
          .then(() => {
            const svg = d3.select('svg.' + exchange.id);
            drawOrderbook(this.state.orderbooks[exchange.id], svg, d3);
          });
      });
  }

  async getOrderbook(_exchange) {
    const response = await fetch(_exchange.url);
    const orderbook = await response.json();
    this.normalizeOrderbook(_exchange.id, orderbook);
  }

  normalizeOrderbook(_exchangeId, _orderbook) {
    this.restructureOrderbook(_exchangeId, _orderbook);
    this.interpolateMissingPoints(_exchangeId);
  }

  restructureOrderbook(_exchangeId, _orderbook) {
    let structuredOrderbook = [];

    switch (_exchangeId) {
      case 'bittrex':
        for (const type in _orderbook.result) {
          if (_orderbook.result.hasOwnProperty(type)) {
            const cleanType = type === 'buy'
              ? 'bid'
              : 'ask';
            const orders = _orderbook.result[type];
            let runningTotal = 0;
            orders.forEach(order => {
              let {Quantity: total, Rate: price} = order;
              price = String(price);
              runningTotal += total;
              structuredOrderbook.push({type: cleanType, total: runningTotal, price});
            });
          }
        }
        break;
      case 'poloniex':
        for (const type in _orderbook) {
          if (_orderbook.hasOwnProperty(type) && ['asks', 'bids'].includes(type)) {
            const cleanType = type === 'bids'
              ? 'bid'
              : 'ask';
            const orders = _orderbook[type];
            let runningTotal = 0;
            orders.forEach(order => {
              let {0: price, 1: total} = order;
              runningTotal += total;
              structuredOrderbook.push({type: cleanType, total: runningTotal, price});
            });
          }
        }
        break;
      default:
        console.error('An unknown exchange was provided; unable to deduce structure.');
        break;
    }

    this.setState({
      orderbooks: {
        ...this.state.orderbooks,
        [_exchangeId]: structuredOrderbook
      }
    });
  }

  interpolateMissingPoints(_exchangeId) {
    // Interpolate points that exist in another orderbook but not in this one
  }

  render() {
    return (
      <div className="row">
        <div className="col-6">
          <h3>Bittrex</h3>
          <svg className="bittrex"/>
        </div>
        <div className="col-6">
          <h3>Poloniex</h3>
          <svg className="poloniex"/>
        </div>
      </div>
    );
  }
}

export default Orderbook;
