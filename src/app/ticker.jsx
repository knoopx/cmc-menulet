import React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'

import Input from './input'
import PrettyPrice from './pretty-price'
import PrettyPercent from './pretty-percent'
import TickerSparkline from './ticker-sparkline'

@observer
export default class Ticker extends React.Component {
  componentWillMount() {
    this.props.ticker.setIsVisible(true)
  }

  componentWillUnmount() {
    this.props.ticker.setIsVisible(false)
  }

  render() {
    const {
      id,
      name,
      symbol,
      holdings,
      amount,
      setHoldings,
      price,
      baseCurrency,
      percent_change_1h,
      percent_change_24h,
      percent_change_7d,
      history,
    } = this.props.ticker
    return (
      <div
        className="flex ph2 pv1 bb b--black-10 lh-copy items-center"
        style={{ height: 100 }}
        key={id}
      >
        <div className="flex items-start">
          <div className="flex-auto">
            <div className="b gray-3 tr">{symbol}</div>
            <div className="flex items-end justify-between">
              {/* <div className="f7">
                <PrettyPrice className amount={price} /> {baseCurrency}
              </div> */}
            </div>
            {/* <i
              style={{ minWidth: 24 }}
              className={classNames('f3 gray-6', `cc ${symbol}`)}
            /> */}
            <div className="flex">
              <div className="flex-auto">
                {/* <div className="gray-7 f7 flex">
                  <PrettyPrice className="flex-auto" amount={amount} />
                  <span className="ml1">{baseCurrency}</span>
                </div> */}
                {/* <div className="gray-7 f7 flex">
                  <Input
                    className="flex-auto bn"
                    value={holdings}
                    onChange={(e) => {
                      setHoldings(e.target.valueAsNumber)
                    }}
                  />
                  <span className="ml1">{symbol}</span>
                </div> */}
              </div>

              <div
                className="flex flex-auto flex-column items-end"
                style={{ fontSize: 11, width: 70 }}
              >
                <div className="nowrap">
                  <PrettyPercent value={percent_change_1h} /> 1H
                </div>
                <div className="nowrap">
                  <PrettyPercent value={percent_change_24h} /> 1D
                </div>
                <div className="nowrap">
                  <PrettyPercent value={percent_change_7d} /> 7D
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-auto ml2">
          <TickerSparkline ticker={this.props.ticker} height={80} />
        </div>

        {/* <div
          className="flex flex-column justify-end gray-3"
          style={{ width: 160 }}
        >
          <div>
            <PrettyPrice amount={price} /> {baseCurrency}
          </div>
          <div className="flex flex-column items-end" style={{ fontSize: 11 }}>
            <div>
              <PrettyPercent value={percent_change_1h} /> 1H
            </div>
            <div>
              <PrettyPercent value={percent_change_24h} /> 1D
            </div>
            <div>
              <PrettyPercent value={percent_change_7d} /> 7D
            </div>
          </div>
        </div> */}
      </div>
    )
  }
}
