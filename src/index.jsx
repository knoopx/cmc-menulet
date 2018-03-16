import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { debounce } from 'lodash'

import App from './app'
import Store from './store'

const store = Store.create(localStorage.store ? JSON.parse(localStorage.store) : {})

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.querySelector('#root'),
  )
}

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)

if (module.hot) {
  module.hot.accept('./app', render)

  if (module.hot.data && module.hot.data.store) {
    module.hot.accept('./store', () => {
      applySnapshot(store, module.hot.data.store)
    })
  }
  module.hot.dispose((data) => {
    data.store = getSnapshot(store)
  })
}

render()
