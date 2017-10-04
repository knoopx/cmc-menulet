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
    const { ticker, parentWidth } = this.props
    const { id, name, symbol, holdings, setHoldings, price, baseCurrency, percent_change_1h, percent_change_24h, percent_change_7d, history } = ticker

    if (history.isFetching) {
      return (
        <div className="flex flex-auto items-center justify-center">
          <Spinner size={24} color={gray[6]} />
        </div>
      )
    }

    return (
      <div className="relative">
        <Fader>
          <Sparkline width={parentWidth} data={history.data} />
          {history.hasError && (
            <div className="absolute absolute--fill flex flex-auto items-center justify-center">
              <MdWarning className="gray-6" size={24} />
            </div>
          )}

          {!history.hasError && history.data.length === 0 && (
            <div className="absolute absolute--fill flex flex-auto items-center justify-center">
              <MdCloudOff className="gray-6" size={24} />
            </div>
          )}
        </Fader>
      </div>
    )
  }
}

export default withParentSize(TickerSparkline)
