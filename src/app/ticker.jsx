import React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'

import Input from './input'
import PrettyPrice from './pretty-price'
import PrettyPercent from './pretty-percent'
import TickerSparkline from './ticker-sparkline'

@observer
export default class Ticker extends React.Component {
  render() {
    const { id, name, symbol, holdings, setHoldings, price, baseCurrency, percent_change_1h, percent_change_24h, percent_change_7d, history } = this.props.ticker
    return (
      <div className="flex ph3 pv2 bb b--black-10 lh-copy items-center" style={{ height: 72 }} key={id}>
        <div className="flex items-center" style={{ width: 100 }}>
          <div className="mr3" style={{ minWidth: 24 }}>
            <i className={classNames('f3 gray-6', `cc-${symbol}`)} />
          </div>
          <div className="flex-auto">
            <div className="b gray-3 truncate">{symbol}</div>
            <div className="f7 gray-6 truncate">{name}</div>
          </div>
        </div>
        <div className="flex flex-auto mh3">
          <TickerSparkline ticker={this.props.ticker} />
        </div>
        <div className="flex flex-column items-end gray-3" style={{ width: 160 }}>
          <div><PrettyPrice amount={price} /> {baseCurrency}</div>
          <div className="" style={{ fontSize: 9 }}>
            <span className="mr1">1H: <PrettyPercent value={percent_change_1h} /></span>
            <span className="mr1">1D: <PrettyPercent value={percent_change_24h} /></span>
            <span>7D: <PrettyPercent value={percent_change_7d} /></span>
          </div>
          <div className="gray-7 f7">
            <Input className="tr bn" style={{ paddingRight: 8, marginRight: -22 }} type="number" value={holdings} onChange={(e) => { setHoldings(e.target.valueAsNumber) }} />
          </div>
        </div>
      </div>
    )
  }
}
