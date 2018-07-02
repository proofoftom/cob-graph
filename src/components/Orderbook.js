import React, {Component} from 'react';
import ReactHighcharts from 'react-highcharts';

/**
 * A visualization of the BTC/ETH market for multiple exchanges and their combined volumes
 *
 * @class Orderbook
 * @extends {Component}
 */
class Orderbook extends Component {

  // The exchanges available to retrieve markets from
  exchanges = [
    {
      id: 'bittrex',
      url: 'https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-ETH&type=both'
    }, {
      id: 'poloniex',
      url: 'https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=100'
    }
  ];

  /**
   * Creates an instance of Orderbook
   * @memberof Orderbook
   */
  constructor() {
    super();

    // Configuration for the visualization
    this.state = {
      config: {
        chart: {
          type: 'area'
        },
        title: {
          text: 'BTC/ETH'
        },
        xAxis: {
          visible: false
        },
        yAxis: {
          title: {
            text: 'Order Volume (Total)'
          }
        },
        tooltip: {
          split: true
        },
        plotOptions: {
          area: {
            stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
              lineWidth: 1,
              lineColor: '#666666'
            }
          }
        },
        series: []
      }
    };

    // Get the orderbook data for available exchanges
    this
      .exchanges
      .forEach(exchange => {
        this.getOrderbook(exchange)
      });

  }

  /**
   * Get the orderbook data (asks/bids) for the provided exchange
   *
   * @param {Object} _exchange The object containing the name and url of an exchange
   * @memberof Orderbook
   */
  async getOrderbook(_exchange) {
    const response = await fetch(_exchange.url);
    const orderbook = await response.json();
    this.normalizeOrderbook(_exchange.id, orderbook);
  }

  /**
   * Massage an exchange's orderbook data to prepare for graph consumption
   *
   * @param {string} _exchangeId The name of the provided exchange
   * @param {Object} _orderbook An exchange API response needing to be normalized
   * @memberof Orderbook
   */
  normalizeOrderbook(_exchangeId, _orderbook) {
    let tempData = [];

    // Todo: Refactor this to be more general
    switch (_exchangeId) {
      case 'bittrex':
        // type: [buy, sell]
        for (const type in _orderbook.result) {
          if (_orderbook.result.hasOwnProperty(type)) {
            // Load the orders of current type
            const orders = _orderbook.result[type];
            // Keep a running total of the orders
            let runningTotal = 0;
            // Add entries to array in form [x,runningTotal]
            orders.forEach(order => {
              let {Rate: x, Quantity: y} = order;
              x = String(x);
              runningTotal += y;
              tempData.push([x, runningTotal]);
            });
            // Reverse the "buy" side of the array
            if (type === 'buy') {
              tempData.reverse();
            }
          }
        }
        break;
      case 'poloniex':
        // type: [asks, bids]
        for (const type in _orderbook) {
          if (_orderbook.hasOwnProperty(type) && ['asks', 'bids'].includes(type)) {
            // Load the orders of current type
            const orders = _orderbook[type];
            // Keep a running total of the orders
            let runningTotal = 0;
            // Add entries to array in form [x,runningTotal]
            orders.forEach(order => {
              let {0: x, 1: y} = order;
              runningTotal += y;
              tempData.push([x, runningTotal]);
            });
            // Reverse the "asks" side of the array
            if (type === 'asks') {
              tempData.reverse();
            }
          }
        }
        break;
      default:
        console.error('An unknown exchange was provided: ' + _exchangeId);
        break;
    }

    // Store series data for this exchange
    const series = {
      name: _exchangeId,
      data: tempData
    };

    // Copy current config and add series
    let config = this.state.config;
    config['series'].push(series);

    this.setState({config});
  }

  /**
   * Return the rendered orderbook visualization
   *
   * @returns
   * @memberof Orderbook
   */
  render() {
    return (
      <div className="row">
        <div className="col-12">
          <h2>Combined Order Book</h2>
        </div>
        <div className="col-6">
          <h3>Bids</h3>
        </div>
        <div className="col-6">
          <h3>Asks</h3>
        </div>
        <div className="col-12">
          <ReactHighcharts config={this.state.config}/>
        </div>
      </div>
    );
  }
}

export default Orderbook;
