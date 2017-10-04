import React from 'react'
import classNames from 'classnames'
import { observer, inject } from 'mobx-react'
import { gray } from 'open-color'

import Input from './input'
import Ticker from './ticker'
import Counter from './counter'
import Spinner from './spinner'
import PeriodSwitcher from './period-switcher'

import PrettyPrice from './pretty-price'
import PrettyPercent from './pretty-percent'
import VirtualList from './virtual-list'
import baseCurrencies from '../data/base-currencies'

@inject('store')
@observer
export default class App extends React.Component {
  renderItem(ticker) {
    return (
      <Ticker
        key={ticker.id}
        ticker={ticker}
      />
    )
  }

  render() {
    const { store } = this.props
    return (
      <div className="sans-serif gray-5 bg-gray-8 vh-100 flex overflow-hidden flex flex-column">
        <div className="flex flex-none ph3 pv3 bb b--black-10 items-center">
          <div className="flex flex-auto items-center">
            {store.isFetching ?
              <Spinner size={24} color={gray[6]} /> :
              <Counter size={24} percent={store.remainingTime / store.refreshInterval} />
            }
          </div>
          <div className="flex flex-auto flex-row items-center justify-center">
            <span className="f2 mr3">
              <PrettyPrice amount={store.portfolioValue} />
            </span>
            <select
              className="input-reset outline-0 color-inherit bn bg-transparent f5 pointer mt1 p0"
              defaultValue={store.baseCurrency}
              onChange={e => store.setBaseCurrency(e.target.value)}
            >
              {baseCurrencies.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-auto items-center justify-end" >
            <div className="flex flex-column items-end pr3" style={{ fontSize: 11 }}>
              <div><PrettyPercent value={store.portfolioChange1h} /> 1H</div>
              <div><PrettyPercent value={store.portfolioChange1d} /> 1D</div>
              <div><PrettyPercent value={store.portfolioChange7d} /> 7D</div>
            </div>
          </div>
        </div>

        <div className="flex flex-none ph3 pv2 bb b--black-10">
          <div
            className={classNames('pointer ba ph2 pv1 br2 b--gray-7 mr2', { 'bg-gray-7': store.showOnlyHolding, 'bg-transparent': !store.showOnlyHolding })}
            onClick={store.toggleOnlyHolding}
          >HOLD</div>
          <Input className="ba ph2 pv1 br2 b--gray-7 mr2" type="search" value={store.query} placeholder="Filter..." onChange={store.setQuery} />
          <PeriodSwitcher />
        </div>
        <VirtualList items={store.matchingTickers} itemHeight={100} renderItem={this.renderItem} />
      </div>
    )
  }
}
