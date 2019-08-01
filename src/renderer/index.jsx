import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { debounce } from 'lodash'

import AppRouter from './routes/AppRouter'
import Store from './store'

const store = Store.create(
  localStorage.store ? JSON.parse(localStorage.store) : {},
)

ReactDOM.render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
  document.querySelector('#root'),
)

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)
