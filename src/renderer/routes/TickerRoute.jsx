import React from 'react'
import classNames from 'classnames'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'

import MainLayout from 'layouts/MainLayout'
import PrettyPrice from 'components/PrettyPrice'
import NumericInput from 'components/NumericInput'

const TickerRoute = ({ store, match }) => {
  const ticker = store.tickers.get(match.params.id)
  const {
    id,
    rank,
    name,
    symbol,
    holdings,
    amount,
    setHoldings,
    price,
    baseCurrency,
    last_updated,
    available_supply,
    total_supply,
    market_cap,
    volume,
    percent_change_1h,
    percent_change_24h,
    percent_change_7d,
    history,
  } = ticker

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex flex-auto items-end mb-6">
          <div className={classNames('text-2xl text-gray-6', `cc ${symbol}`)} />
          <div className="text-2xl text-gray-1 ml-2">{name}</div>
          <div className="ml-2">{symbol}</div>
          <PrettyPrice
            className={classNames('text-2xl flex flex-auto ml-auto justify-end', {
              'text-green-5': percent_change_1h > 0,
              'text-red-5': percent_change_1h < 0,
            })}
            amount={price}
            suffix={baseCurrency}
          />
        </div>

        <dl>
          <dt>Holdings</dt>
          <dd className="flex flex-col flex-auto ml-auto items-end">
            <PrettyPrice className="text-gray-6 flex flex-auto" amount={amount} suffix={baseCurrency} />
            <div className="text-gray-6 flex items-center">
              <NumericInput
                className="text-right"
                value={holdings}
                onChange={(e) => {
                  setHoldings(parseFloat(e.target.value))
                }}
              />
              <span className="font-hairline ml-1">{symbol}</span>
            </div>
          </dd>

          <dt>Rank</dt>
          <dd>
#
            {rank}
          </dd>
          <dt>Market Capitalization</dt>
          <dd>
            <PrettyPrice amount={market_cap} suffix={baseCurrency} />
          </dd>
          <dt>Volume</dt>
          <dd><PrettyPrice amount={volume} suffix={baseCurrency} /></dd>
          {/* <dt>Total Supply</dt>
          <dd><PrettyPrice amount={total_supply} /></dd>
          <dt>Available Supply</dt>
          <dd><PrettyPrice amount={available_supply} /></dd> */}
        </dl>
      </div>
    </MainLayout>
  )
}

export default withRouter(inject('store')(observer(TickerRoute)))
