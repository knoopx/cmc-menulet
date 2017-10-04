import numeral from 'numeral'
import { sum, sortBy } from 'lodash'
import { types, getSnapshot } from 'mobx-state-tree'
import { autorun, untracked } from 'mobx'
import { now } from 'mobx-utils'
import { ipcRenderer } from 'electron'

import Ticker from './ticker'
import baseCurrencies from '../data/base-currencies'

// https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=ETH&tsym=BTC
// http://coinmarketcap.io/apiUpdateCoinDb.php?callback=jQuery321010028499331151552_1504190298069&updatecoindb=yes&_=1504190298070
// http://coinmarketcap.io/system_coin_db_v2.js

function parseTicker({ rank, last_updated, available_supply, total_supply, percent_change_1h, percent_change_24h, percent_change_7d, ...props }) {
  return {
    ...props,
    rank: parseInt(rank),
    last_updated: parseInt(last_updated),
    available_supply: parseFloat(available_supply),
    total_supply: parseFloat(total_supply),
    percent_change_1h: parseFloat(percent_change_1h),
    percent_change_24h: parseFloat(percent_change_24h),
    percent_change_7d: parseFloat(percent_change_7d),
    ...baseCurrencies.map(x => x.toLocaleLowerCase()).reduce((result, c) => ({
      ...result,
      ...[`price_${c}`, `24h_volume_${c}`, `market_cap_${c}`].reduce((res, propName) => ({
        ...res,
        [propName]: props[propName] ? parseFloat(props[propName]) : null,
      }), {}),
    }), {}),
  }
}

export default types.model('Store', {
  lastUpdate: types.maybe(types.number),
  query: types.optional(types.string, ''),
  baseCurrency: types.optional(types.string, 'USD'),
  tickers: types.optional(types.map(Ticker), {}),
  // tickerLimit: types.optional(types.number, 25),
  refreshInterval: types.optional(types.number, 30000),
  isFetching: types.optional(types.boolean, false),
  showOnlyHolding: types.optional(types.boolean, false),
})
  .views(self => ({
    get matchingHoldingsTickers() {
      const tickers = self.tickers.values()
      if (self.showOnlyHolding) {
        return tickers.filter(({ holdings }) => holdings > 0)
      }
      return tickers
    },
    get matchingTickers() {
      return sortBy(self.matchingHoldingsTickers.filter(t => t.matches(self.query)), 'rank')
    },
    get portfoioValue() {
      return sum(self.tickers.values().map(c => c.holdings * c.price))
    },
    get portfoioChange1h() {
      const x = self.tickers.values().filter(c => c.percent_change_1h)
      return sum(x.map(c => c.percent_change_1h)) / x.length
    },
    get portfoioChange1d() {
      const x = self.tickers.values().filter(c => c.percent_change_24h)
      return sum(x.map(c => c.percent_change_24h)) / x.length
    },
    get portfoioChange7d() {
      const x = self.tickers.values().filter(c => c.percent_change_7d)
      return sum(x.map(c => c.percent_change_7d)) / x.length
    },
    get nextUpdateAt() {
      return self.lastUpdate + self.refreshInterval
    },
    get remainingTime() {
      if (self.nextUpdateAt < now()) {
        return 0
      }
      return self.nextUpdateAt - now()
    },
  }))
  .actions(self => ({
    afterCreate() {
      autorun(self.fetchTickers)
      autorun(() => {
        if (self.remainingTime === 0) {
          untracked(() => { self.fetchTickers() })
        }
      })
      autorun(() => { ipcRenderer.send('set-title', `${numeral(self.portfoioValue).format('0,0.00')} ${self.baseCurrency}`) })
    },
    async fetchTickers() {
      self.setIsFetching(true)
      try {
        const url = new URL('https://api.coinmarketcap.com/v1/ticker/')
        url.searchParams.append('convert', self.baseCurrency)
        // url.searchParams.append('limit', self.tickerLimit)
        url.searchParams.append('fresh', Date.now())
        const response = await fetch(url)
        self.setTickers(await response.json())
      } finally {
        self.setIsFetching(false)
        self.touch()
      }
    },
    touch() {
      self.lastUpdate = Date.now()
    },
    toggleOnlyHolding() {
      self.showOnlyHolding = !self.showOnlyHolding
    },
    setIsFetching(value) {
      self.isFetching = value
    },
    setTickers(tickers) {
      tickers.map(self.mergeTicker)
    },
    setBaseCurrency(value) {
      self.baseCurrency = value
    },
    mergeTicker({ id, ...props }) {
      const data = parseTicker({ id, ...props })
      const ticker = self.tickers.get(id)
      if (ticker) {
        Object.assign(ticker, data)
      } else {
        self.tickers.set(id, data)
      }
    },
    setQuery(e) {
      self.query = e.target.value
    },
    setHoldings(ticker, amount) {
      self.holdings.set(ticker.id, { amount })
    },
  }))
