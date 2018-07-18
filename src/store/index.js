import numeral from 'numeral'
import { sum, sortBy } from 'lodash'
import { types, flow } from 'mobx-state-tree'
import { autorun, observe, untracked, values } from 'mobx'
import { now } from 'mobx-utils'
import { ipcRenderer } from 'electron'

import Ticker from './ticker'

import baseCurrencies from '../data/base-currencies'
import periods from '../data/periods'

// https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=ETH&tsym=BTC
// http://coinmarketcap.io/apiUpdateCoinDb.php?callback=jQuery321010028499331151552_1504190298069&updatecoindb=yes&_=1504190298070
// http://coinmarketcap.io/system_coin_db_v2.js

function parseTicker({
  rank,
  last_updated,
  available_supply,
  total_supply,
  percent_change_1h,
  percent_change_24h,
  percent_change_7d,
  ...props
}) {
  return {
    ...props,
    rank: parseInt(rank),
    last_updated: parseInt(last_updated),
    available_supply: parseFloat(available_supply),
    total_supply: parseFloat(total_supply),
    percent_change_1h: parseFloat(percent_change_1h),
    percent_change_24h: parseFloat(percent_change_24h),
    percent_change_7d: parseFloat(percent_change_7d),
    ...baseCurrencies.map(x => x.toLocaleLowerCase()).reduce(
      (result, c) => ({
        ...result,
        ...[`price_${c}`, `24h_volume_${c}`, `market_cap_${c}`].reduce(
          (res, propName) => ({
            ...res,
            [propName]: props[propName] ? parseFloat(props[propName]) : null,
          }),
          {},
        ),
      }),
      {},
    ),
  }
}

export default types
  .model('Store', {
    lastUpdate: types.maybeNull(types.number),
    query: types.optional(types.string, ''),
    baseCurrency: types.optional(types.string, 'USD'),
    tickers: types.optional(types.map(Ticker), {}),
    // tickerLimit: types.optional(types.number, 25),
    refreshInterval: types.optional(types.number, 30000),
    isFetching: types.optional(types.boolean, false),
    showOnlyHolding: types.optional(types.boolean, false),
    period: types.optional(types.enumeration(periods), '1W'),
    coinMarketCapIOKey: types.optional(types.string, ''),
  })
  .views(self => ({
    get matchingHoldingsTickers() {
      if (self.showOnlyHolding) {
        return self.holdingTickers
      }
      return values(self.tickers)
    },
    get holdingTickers() {
      return values(self.tickers).filter(({ holdings }) => holdings > 0)
    },
    get matchingTickers() {
      return sortBy(
        self.matchingHoldingsTickers.filter(t => t.matches(self.query)),
        'rank',
      )
    },
    get portfolioValue() {
      return sum(self.holdingTickers.map(c => c.holdings * c.price))
    },
    get portfolioChange1h() {
      const x = self.holdingTickers.filter(c => c.percent_change_1h)
      return sum(x.map(c => c.percent_change_1h)) / x.length
    },
    get portfolioChange1d() {
      const x = self.holdingTickers.filter(c => c.percent_change_24h)
      return sum(x.map(c => c.percent_change_24h)) / x.length
    },
    get portfolioChange7d() {
      const x = self.holdingTickers.filter(c => c.percent_change_7d)
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
  .actions((self) => {
    const disposables = []
    return {
      afterCreate() {
        self.setIcon('▲', 'green')
        disposables.push(autorun(self.fetchTickers))
        disposables.push(autorun(() => {
          if (self.coinMarketCapIOKey.length === 64) {
            self.fetchCoinMarketCapIOHoldings()
          }
        }))
        disposables.push(autorun(() => {
          if (self.remainingTime === 0) {
            untracked(() => {
              self.fetchTickers()
            })
          }
        }))
        disposables.push(observe(self, 'portfolioValue', ({ oldValue, newValue }) => {
          ipcRenderer.send(
            'set-title',
            `${numeral(newValue).format('0,0.00')} ${self.baseCurrency}`,
          )

          if (newValue > oldValue) {
            self.setIcon('▲', 'green')
          } else if (newValue < oldValue) {
            self.setIcon('▼', 'red')
          } else {
            self.setIcon('▶', 'black')
          }
        }))
        disposables.push(autorun(() => {
          if (self.remainingTime === 0) {
            untracked(() => {
              self.fetchTickers()
            })
          }
        }))
      },
      setIcon(char, color) {
        const size = 22
        const fontSize = 18
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = size
        canvas.width = size
        context.fillStyle = color
        context.font = `${fontSize}px Arial`
        const { width } = context.measureText(char)
        context.fillText(char, size / 2 - width / 2, fontSize)
        ipcRenderer.send('set-icon', canvas.toDataURL())
      },
      beforeDestroy() {
        disposables.forEach((dispose) => {
          dispose()
        })
      },
      fetchTickers: flow(function* () {
        self.setIsFetching(true)
        try {
          const url = new URL('https://api.coinmarketcap.com/v1/ticker/')
          url.searchParams.append('convert', self.baseCurrency)
          // url.searchParams.append('limit', self.tickerLimit)
          url.searchParams.append('fresh', Date.now())
          const response = yield fetch(url)
          self.setTickers(yield response.json())
        } finally {
          self.setIsFetching(false)
          self.touch()
        }
      }),
      fetchCoinMarketCapIOHoldings: flow(function* () {
        const url = 'https://cmc.tools/server/api.php'
        const form = new FormData()
        const opts = {
          login: 1,
          private_key: self.coinMarketCapIOKey,
          user: false,
          settings: false,
          last_page_view: false,
          last_coin_view: false,
          market_cap: false,
          coin_list: false,
          atz: false,
          currencies: false,
          injector: false,
          holdings: true,
          watchlist: false,
        }

        Object.keys(opts).forEach((key) => {
          form.append(key, opts[key])
        })

        try {
          const res = yield fetch(url, {
            method: 'post',
            body: form,
          })
          const json = yield res.json()
          self.tickers.values().forEach((ticker) => {
            const match = json.coin_list.find(c => c.cmc_id === ticker.id)
            if (match) {
              ticker.setHoldings(Number(match.amount))
            }
          })
        } catch (err) {
          self.setCoinMarketCapIOKey('')
        }
      }),
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
      setPeriod(value) {
        self.period = value
      },
      setCoinMarketCapIOKey(key) {
        self.coinMarketCapIOKey = key
      },
    }
  })
