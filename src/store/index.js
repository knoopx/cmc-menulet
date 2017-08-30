import { onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { debounce } from 'lodash'

import Store from './store'

const store = Store.create(JSON.parse(localStorage.store || '{}'))

onSnapshot(store, debounce((snapshot) => {
  localStorage.store = JSON.stringify(snapshot)
}, 1000))

if (module.hot) {
  if (module.hot.data && module.hot.data.store) {
    module.hot.accept('./store', () => {
      applySnapshot(store, module.hot.data.store)
    })
  }
  module.hot.dispose((data) => {
    data.store = getSnapshot(store)
  })
}

export default store
