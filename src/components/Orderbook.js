import React, {Component} from 'react';
import ReactHighcharts from 'react-highcharts';

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
      config: {
        chart: {
          type: 'area'
        },
        title: {
          text: 'Combined Order Book'
        },
        subtitle: {
          // text: 'Source: Wikipedia.org'
        },
        xAxis: {
          // tickmarkPlacement: 'on',
          title: {
            enabled: false
          }
        },
        yAxis: {
          title: {
            // text: 'Billions'
          },
          labels: {
            // formatter: function () {   return this.value / 1000; }
          }
        },
        tooltip: {
          split: true
          // valueSuffix: ' millions'
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

    this
      .exchanges
      .forEach(exchange => {
        this.getOrderbook(exchange)
      });

  }

  async getOrderbook(_exchange) {
    const response = await fetch(_exchange.url);
    const orderbook = await response.json();
    this.normalizeOrderbook(_exchange.id, orderbook);
  }

  normalizeOrderbook(_exchangeId, _orderbook) {
    let tempData = [];

    switch (_exchangeId) {
      case 'bittrex':
        for (const type in _orderbook.result) {
          if (_orderbook.result.hasOwnProperty(type)) {
            const orders = _orderbook.result[type];
            let runningTotal = 0;
            orders.forEach(order => {
              let {Rate: x, Quantity: y} = order;
              x = String(x);
              runningTotal += y;
              tempData.push([x, runningTotal]);
            });
            if (type === 'buy') {
              tempData.reverse();
            }
          }
        }
        break;
      case 'poloniex':
        for (const type in _orderbook) {
          if (_orderbook.hasOwnProperty(type) && ['asks', 'bids'].includes(type)) {
            const orders = _orderbook[type];
            let runningTotal = 0;
            orders.forEach(order => {
              let {0: x, 1: y} = order;
              runningTotal += y;
              tempData.push([x, runningTotal]);
            });
            if (type === 'asks') {
              tempData.reverse();
            }
          }
        }
        break;
      default:
        console.error('An unknown exchange was provided; unable to deduce structure.');
        break;
    }
    const series = {
      name: _exchangeId,
      data: tempData
    };

    let config = this.state.config;
    config['series'].push(series);

    this.setState({config});
  }

  render() {
    return (
      <div className="row">
        <div className="col-12">
          <h2>BTC/ETH</h2>
        </div>
        <div className="col-6">
          <h3>Bids</h3>
        </div>
        <div className="col-6">
          <h3>Asks</h3>
        </div>
        <div className="col-12"><ReactHighcharts config={this.state.config}/></div>
      </div>
    );
  }
}

export default Orderbook;
