import { types, getParent } from 'mobx-state-tree'

import baseCurrencies from '../data/base-currencies'
import History from './history'

const propTypes = baseCurrencies.map(x => x.toLocaleLowerCase()).reduce((props, c) => ({
  ...props,
  [`price_${c}`]: types.maybe(types.number),
  [`24h_volume_${c}`]: types.maybe(types.number),
  [`market_cap_${c}`]: types.maybe(types.number),
}), {})

export default types.model('Ticker', {
  id: types.identifier(types.string),
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
  history: types.optional(History, {}),

  isVisible: types.optional(types.boolean, false),
})
  .preProcessSnapshot(props => ({ ...props, isVisible: false }))
  .views(self => ({
    get price() {
      return self[`price_${self.baseCurrency.toLocaleLowerCase()}`]
    },
    get baseCurrency() {
      return getParent(self, 2).baseCurrency
    },
    matches(query) {
      return [self.name, self.symbol].map(x => x.toLocaleLowerCase()).some(x => x.indexOf(query.toLocaleLowerCase()) >= 0)
    },
  }))
  .actions(self => ({
    setHoldings(amount) {
      self.holdings = amount
    },
    setIsVisible(value) {
      self.isVisible = value
    },
  }))
