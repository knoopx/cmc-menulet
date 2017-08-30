import React from 'react'
import ReactDOM from 'react-dom'
import { useStrict } from 'mobx'
import { Provider } from 'mobx-react'
import { AppContainer } from 'react-hot-loader'

import App from './app'
import store from './store'

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

if (module.hot) {
  module.hot.accept('./app', render)
}

render()
