import React from 'react'
import ReactDOM from 'react-dom'
import { useStrict } from 'mobx'
import { Provider } from 'mobx-react'
import { AppContainer } from 'react-hot-loader'
import { onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { debounce } from 'lodash'

import App from './app'
import Store from './store'

const store = Store.create(localStorage.store ? JSON.parse(localStorage.store) : {})

useStrict(true)

function render() {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <App />
      </Provider>
    </AppContainer>
    , document.querySelector('#root'),
  )
}

onSnapshot(store, debounce((snapshot) => {
  localStorage.store = JSON.stringify(snapshot)
}, 1000))

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
