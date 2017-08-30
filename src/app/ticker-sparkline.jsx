import React from 'react'
import { observer } from 'mobx-react'
import { Squares } from 'react-activity'
import { nest } from 'd3-collection'
import { mean } from 'd3-array'
import { withParentSize } from '@vx/responsive'

import Sparkline from './sparkline'

@observer
class TickerSparkline extends React.Component {
  componentWillMount() {
    if (!this.props.ticker.wasHistoryFetched) {
      this.props.ticker.fetchHistory()
    }
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.ticker.wasHistoryFetched) {
      nextProps.ticker.fetchHistory()
    }
  }

  render() {
    const { ticker, parentWidth } = this.props
    const { id, name, symbol, holdings, setHoldings, price, baseCurrency, percent_change_1h, percent_change_24h, percent_change_7d, history } = ticker

    if (this.props.ticker.history.length === 0) {
      return (
        <div className="flex flex-auto items-center justify-center">
          <Squares size={12} />
        </div>
      )
    }

    let i = 0
    let x = 0
    const bucketLength = Math.ceil(history.length / 75)
    const data = nest()
      .key((d) => {
        if (++i % bucketLength === 0) { ++x }
        return x
      })
      .rollup(d => ({
        time: d[0].time,
        close: mean(d, e => e.close),
        volumefrom: mean(d, e => e.volumefrom),
      }))
      .entries(history)
      .map(d => d.value)

    return <Sparkline width={parentWidth} data={data} />
  }
}

export default withParentSize(TickerSparkline)
