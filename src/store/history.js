import { autorun, reaction, untracked } from 'mobx'
import { now } from 'mobx-utils'
import { types, getParent, process } from 'mobx-state-tree'
import { nest } from 'd3-collection'

const MAPPING = {
  MIOTA: 'IOT',
}

function aggregate(history, max = 100) {
  let i = 0
  let x = 0
  const bucketLength = Math.ceil(history.length / max)

  return nest()
    .key((dispose) => {
      if (++i % bucketLength === 0) { ++x }
      return x
    })
    .rollup(dispose => ({
      time: dispose[dispose.length - 1].time,
      close: dispose[dispose.length - 1].close,
      volumefrom: dispose[dispose.length - 1].volumefrom,
    }))
    .entries(history)
    .map(dispose => dispose.value)
}

function getSymbol(symbol) {
  return MAPPING[symbol] || symbol
}

const HistoryPoint = types.model('HistoryPoint', {
  time: types.number,
  close: types.maybe(types.number),
  volumefrom: types.maybe(types.number),
})

export default types.model('History', {
  isFetching: types.optional(types.boolean, false),
  hasError: types.optional(types.boolean, false),
  data: types.optional(types.array(HistoryPoint), []),
  lastUpdate: types.maybe(types.number),
})
  .preProcessSnapshot(props => ({
    ...props,
    isFetching: false,
    hasError: false,
  }))
  .views(self => ({
    get url() {
      const ticker = self.ticker

      let url

      switch (getParent(self, 3).period) {
        case '1H':
        case '1D':
          url = new URL('https://min-api.cryptocompare.com/data/histominute')
          break
        case '1W':
        case '1M':
          url = new URL('https://min-api.cryptocompare.com/data/histohour')
          break
        case '3M':
        case '6M':
        case '1Y':
        case '5Y':
          url = new URL('https://min-api.cryptocompare.com/data/histoday')
          break
        default:
          throw new Error('Unknown period')
      }

      switch (getParent(self, 3).period) {
        case '1H':
          url.searchParams.append('aggregate', 1)
          url.searchParams.append('limit', 60)
          break
        case '1D':
          url.searchParams.append('aggregate', 10)
          url.searchParams.append('limit', 144)
          break
        case '1W':
          url.searchParams.append('aggregate', 1)
          url.searchParams.append('limit', 168)
          break
        case '1M':
          url.searchParams.append('aggregate', 6)
          url.searchParams.append('limit', 120)
          break
        case '3M':
          url.searchParams.append('aggregate', 1)
          url.searchParams.append('limit', 90)
          break
        case '6M':
          url.searchParams.append('aggregate', 1)
          url.searchParams.append('limit', 180)
          break
        case '1Y':
          url.searchParams.append('aggregate', 1)
          url.searchParams.append('limit', 365)
          break
        case '5Y':
          url.searchParams.append('aggregate', 1)
          url.searchParams.append('limit', 2000)
          break
        default:
          throw new Error('Unknown period')
      }

      url.searchParams.append('fsym', getSymbol(ticker.symbol))
      url.searchParams.append('tsym', ticker.baseCurrency)
      url.searchParams.append('tryConversion', 'true')

      return url
    },
    get ticker() {
      return getParent(self)
    },
    get store() {
      return getParent(self, 3)
    },
    get nextUpdateAt() {
      return self.lastUpdate + self.store.refreshInterval
    },
    get shouldUpdate() {
      return !self.lastUpdate || self.nextUpdateAt < now()
    },
  }))
  .actions((self) => {
    const disposables = []

    return {
      afterCreate() {
        disposables.push(autorun(() => {
          if (self.ticker.isVisible && self.shouldUpdate) {
            untracked(() => { self.fetch() })
          }
        }))
        disposables.push(reaction(
          () => self.store.period,
          () => {
            if (self.ticker.isVisible) {
              self.fetch()
            }
          },
        ))
      },
      beforeDestroy() {
        disposables.forEach(dispose => dispose())
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
      fetch: process(function* () {
        if (!self.isFetching) {
          self.setIsFetching(true)
          self.setHasError(false)

          try {
            const response = yield fetch(self.url)
            const json = yield response.json()

            if (json.Response === 'Error') {
              throw new Error(json.Message)
            }

            self.setData(aggregate(json.Data))
          } catch (err) {
            console.error(err)
            self.setHasError(true)
          } finally {
            self.touch()
            self.setIsFetching(false)
          }
        }
      }),
      touch() {
        self.lastUpdate = Date.now()
      },
    }
  })
