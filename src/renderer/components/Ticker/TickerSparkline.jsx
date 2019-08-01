import React from 'react'
import { gray, red, green } from 'open-color'
import { inject, observer } from 'mobx-react'
import { withParentSize } from '@vx/responsive'
import { MdWarning, MdCloudOff } from 'react-icons/md'
import {
  timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear,
} from 'd3-time'


import Spinner from 'components/Spinner'
import Sparkline from './Sparkline'

const getTickValues = (period) => {
  const now = new Date()
  switch (period) {
    case '1H':
      return timeMinute.range(timeMinute.offset(now, -60), timeDay.ceil(now), 5) // 5 minutes / last 60 minutes
    case '1D':
      return timeHour.range(timeHour.offset(timeHour.floor(now), -24), timeDay.ceil(now)) // 1 hour / last 24 hours
    case '1W':
      return timeDay.range(timeDay.offset(timeDay.floor(now), -7), timeWeek.ceil(now)) // 1 day / last 7 days
    case '1M':
      return timeWeek.range(timeDay.offset(timeMonth.floor(now), -30), timeMonth.ceil(now)) // 1 week / last 30 days
    case '3M':
      return timeWeek.range(timeMonth.offset(timeMonth.floor(now), -3), timeMonth.ceil(now)) // 1 week / last 3 months
    case '6M':
      return timeMonth.range(timeMonth.offset(timeMonth.floor(now), -6), timeMonth.ceil(now)) // 1 month / last 6 months
    case '1Y':
      return timeMonth.range(timeMonth.offset(timeMonth.floor(now), -12), timeMonth.ceil(now)) // 1 month / last 12 months
    case '5Y':
      return timeYear.range(timeYear.offset(timeMonth.floor(now), -5), timeMonth.ceil(now)) // 1 year / last 5 years
    default:
      return []
  }
}

const TickerSparkline = ({
  store, ticker, height, parentWidth,
}) => {
  const {
    id,
    name,
    symbol,
    holdings,
    setHoldings,
    price,
    baseCurrency,
    percent_change_1h,
    percent_change_24h,
    percent_change_7d,
    history,
  } = ticker

  const getStatus = () => {
    if (history.isFetching) {
      return <Spinner className="bg-gray-5" size={24} />
    }

    if (history.hasError) {
      return <MdWarning className="text-gray-5" size={24} />
    }

    if (history.data.length === 0) {
      return <MdCloudOff className="text-gray-5" size={24} />
    }

    return null
  }

  const status = getStatus()

  const tickValues = getTickValues(store.period)

  return (
    <div className="relative">
      {history.data.length > 0 && (
        <Sparkline
          id={id}
          tickValues={tickValues}
          width={parentWidth}
          data={history.data}
          height={height}
          stroke={percent_change_1h < 0 ? red[5] : green[5]}
        />
      )}
      {status && (
        <div className="absolute inset-0 flex flex-auto items-center justify-center">
          {status}
        </div>
      )}
    </div>
  )
}

export default withParentSize(inject('store')(observer(TickerSparkline)))
