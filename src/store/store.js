import numeral from 'numeral'
import { sum, sortBy } from 'lodash'
import { types, getSnapshot } from 'mobx-state-tree'
import { filter } from 'fuzzaldrin'
import { autorun } from 'mobx'
import { ipcRenderer } from 'electron'

import Ticker from './ticker'

// https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=ETH&tsym=BTC
// http://coinmarketcap.io/apiUpdateCoinDb.php?callback=jQuery321010028499331151552_1504190298069&updatecoindb=yes&_=1504190298070
// http://coinmarketcap.io/system_coin_db_v2.js

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
      if (self.showOnlyHolding) {
        return self.tickers.values().filter(({ holdings }) => holdings > 0)
      }
      return self.tickers.values()
    },
    get matchingTickers() {
      return sortBy(filter(self.matchingHoldingsTickers, self.query, { key: 'fuzzy' }), 'rank')
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
  }))
  .actions(self => ({
    afterCreate() {
      self.next()
      autorun(self.fetchTickers)
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
    next() {
      setTimeout(async () => {
        await self.fetchTickers()
        self.next()
      }, self.refreshInterval)
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
      tickers.map(self.mergeTicker).forEach((ticker) => { self.tickers.set(ticker.id, ticker) })
    },
    setBaseCurrency(value) {
      self.baseCurrency = value
    },
    mergeTicker({ id, ...props }) {
      const ticker = self.tickers.get(id)
      if (ticker) {
        return { ...getSnapshot(ticker), ...props, wasHistoryFetched: false }
      }
      return { id, ...props }
    },
    setQuery(e) {
      self.query = e.target.value
    },
    setHoldings(ticker, amount) {
      self.holdings.set(ticker.id, { amount })
    },
  }))
