import React from 'react'
import { gray } from 'open-color'
import { observer } from 'mobx-react'
import { withParentSize } from '@vx/responsive'
import MdWarning from 'react-icons/lib/md/warning'
import MdCloudOff from 'react-icons/lib/md/cloud-off'

import Spinner from './spinner'
import Sparkline from './sparkline'
import Fader from './fader'

@observer
class TickerSparkline extends React.Component {
  render() {
    const { ticker, height, parentWidth } = this.props
    const { id, name, symbol, holdings, setHoldings, price, baseCurrency, percent_change_1h, percent_change_24h, percent_change_7d, history } = ticker

    const status = this.renderStatus()

    return (
      <div className="relative">
        {history.data.length > 0 && <Fader><Sparkline width={parentWidth} data={history.data} height={height} /></Fader>}
        {status && (
          <div className="absolute absolute--fill flex flex-auto items-center justify-center">
            {status}
          </div>
        )}
      </div>
    )
  }

  renderStatus() {
    const { history } = this.props.ticker

    if (history.isFetching) {
      return (
        <Spinner size={24} color={gray[6]} />
      )
    }

    if (history.hasError) {
      return (
        <MdWarning className="gray-6" size={24} />
      )
    }

    if (history.data.length === 0) {
      return (
        <MdCloudOff className="gray-6" size={24} />
      )
    }

    return null
  }
}

export default withParentSize(TickerSparkline)
