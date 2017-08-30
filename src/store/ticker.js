import { types, getParent } from 'mobx-state-tree'
import baseCurrencies from '../data/base-currencies'

const propTypes = baseCurrencies.map(x => x.toLocaleLowerCase()).reduce((props, c) => ({
  ...props,
  [`price_${c}`]: types.maybe(types.number),
  [`24h_volume_${c}`]: types.maybe(types.number),
  [`market_cap_${c}`]: types.maybe(types.number),
}), {})

const HistoryPoint = types.model('HistoryPoint', {
  time: types.number,
  close: types.number,
  volumefrom: types.number,
})

export default types.model('Ticker', {
  isVisible: types.optional(types.boolean, false),

  id: types.identifier(),
  name: types.string,
  symbol: types.string,
  rank: types.number,
  last_updated: types.number,

  available_supply: types.maybe(types.number),
  total_supply: types.maybe(types.number),

  percent_change_1h: types.maybe(types.number),
  percent_change_24h: types.maybe(types.number),
  percent_change_7d: types.maybe(types.number),
  ...propTypes,
  holdings: types.optional(types.number, 0.0),

  wasHistoryFetched: types.optional(types.boolean, false),
  history: types.optional(types.array(HistoryPoint), []),
})
  .preProcessSnapshot(({ rank, last_updated, available_supply, total_supply, percent_change_1h, percent_change_24h, percent_change_7d, ...props }) => ({
    ...props,
    rank: parseInt(rank),
    last_updated: parseInt(last_updated),
    available_supply: parseFloat(available_supply),
    total_supply: parseFloat(total_supply),
    percent_change_1h: parseFloat(percent_change_1h),
    percent_change_24h: parseFloat(percent_change_24h),
    percent_change_7d: parseFloat(percent_change_7d),
    ...Object.keys(propTypes).reduce((result, propName) => ({
      ...result,
      [propName]: parseFloat(props[propName]),
    }), {}),
  }))
  .views(self => ({
    get fuzzy() {
      return [self.name, self.symbol].join(' ')
    },
    get price() {
      return self[`price_${self.baseCurrency.toLocaleLowerCase()}`]
    },
    get baseCurrency() {
      return getParent(self, 2).baseCurrency
    },
  }))
  .actions(self => ({
    setHoldings(amount) {
      self.holdings = amount
    },
    setHistory(data) {
      self.wasHistoryFetched = true
      self.history.replace(data)
    },
    async fetchHistory() {
      const url = new URL('https://min-api.cryptocompare.com/data/histohour')
      url.searchParams.append('fsym', self.symbol)
      url.searchParams.append('tsym', self.baseCurrency)
      url.searchParams.append('limit', 168)
      url.searchParams.append('aggregate', 1)

      const response = await fetch(url)
      const json = await response.json()
      self.setHistory(json.Data)
    },
  }))
