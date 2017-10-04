import { autorun, untracked } from 'mobx'
import { types, getParent } from 'mobx-state-tree'
import { nest } from 'd3-collection'

const MAPPING = {
  MIOTA: 'IOT',
}

function getSymbol(symbol) {
  return MAPPING[symbol] || symbol
}

const HistoryPoint = types.model('HistoryPoint', {
  time: types.number,
  close: types.number,
  volumefrom: types.number,
})

export default types.model('History', {
  isFetching: types.optional(types.boolean, false),
  hasError: types.optional(types.boolean, false),
  data: types.optional(types.array(HistoryPoint), []),
})
  .preProcessSnapshot(props => ({
    ...props,
    isFetching: false,
    hasError: false,
  }))
  .actions((self) => {
    let dispose

    return {
      afterCreate() {
        dispose = autorun(() => {
          if (getParent(self).isVisible && (self.data.length === 0 || getParent(self, 3).remainingTime === 0)) {
            untracked(() => !self.isFetching && self.fetch())
          }
        })
      },
      beforeDestroy() {
        dispose && dispose()
      },
      setData(data) {
        self.data.replace(data)
      },
      setIsFetching(value) {
        self.isFetching = value
      },
      setHasError(value) {
        self.hasError = value
      },
      async fetch() {
        const ticker = getParent(self)
        self.setIsFetching(true)
        self.setHasError(false)

        const url = new URL('https://min-api.cryptocompare.com/data/histohour')
        url.searchParams.append('fsym', getSymbol(ticker.symbol))
        url.searchParams.append('tsym', ticker.baseCurrency)
        url.searchParams.append('limit', 168)
        url.searchParams.append('aggregate', 1)

        try {
          const response = await fetch(url)
          const json = await response.json()

          if (json.Response === 'error') {
            throw new Error(json.Message)
          }

          const history = json.Data

          let i = 0
          let x = 0
          const bucketLength = Math.ceil(history.length / 75)
          self.setData(nest()
            .key((d) => {
              if (++i % bucketLength === 0) { ++x }
              return x
            })
            .rollup(d => ({
              time: d[0].time,
              close: d[d.length - 1].close,
              volumefrom: d[d.length - 1].volumefrom,
            }))
            .entries(history)
            .map(d => d.value))
        } catch (err) {
          console.error(err)
          self.setHasError(true)
        } finally {
          self.setIsFetching(false)
        }
      },
    }
  })
