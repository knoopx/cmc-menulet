import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import PrettyPercent from 'components/PrettyPercent'
import PrettyPrice from 'components/PrettyPrice'
import TickerSparkline from './TickerSparkline'

const Ticker = ({ ticker }) => {
  useEffect(() => {
    ticker.setIsVisible(true)
    return () => {
      ticker.setIsVisible(false)
    }
  }, [])

  const {
    id,
    name,
    symbol,
    price,
    baseCurrency,
    percent_change_1h,
    percent_change_24h,
    percent_change_7d,
  } = ticker

  return (
    <Link
      key={id}
      className="flex no-underline py-1 border-b border-gray-7 leading-tight items-center flex-row-reverse sm:flex-row"
      style={{ height: 100 }}
      to={`/ticker/${id}`}
    >
      <div className="flex px-2 items-center hidden sm:flex sm:flex-col-reverse flex-nowrap" style={{ width: '100px' }}>
        <div className={classNames('text-2xl text-gray-6 mt-2 mx-2', `cc ${symbol}`)} />
        <div className="flex flex-col flex-auto justify-center items-center text-center">
          <div className="font-bold text-gray-3">{symbol}</div>
          <div className="text-gray-6 text-xs">{name}</div>
        </div>
      </div>

      <div className="flex min-w-0 px-2 flex-auto">
        <TickerSparkline ticker={ticker} height={80} />
      </div>

      <div className="flex px-2 flex-col items-end text-gray-3" style={{ width: '100px' }}>
        <div className="font-bold text-gray-3 text-right sm:hidden">{symbol}</div>
        <PrettyPrice
          className={classNames('text-sm sm:text-base', {
            'text-green-5': percent_change_1h > 0,
            'text-red-5': percent_change_1h < 0,
          })}
          amount={price}
          suffix={baseCurrency}
        />
        <div className="flex flex-col items-end text-xs">
          <PrettyPercent value={percent_change_1h} suffix="1H" />
          <PrettyPercent value={percent_change_24h} suffix="1D" />
          <PrettyPercent value={percent_change_7d} suffix="7D" />
        </div>
      </div>
    </Link>
  )
}

export default observer(Ticker)
