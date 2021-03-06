import React from "react"
import { HashRouter, Switch, Route } from "react-router-dom"

import MainRoute from "routes/MainRoute"
import TickerRoute from "routes/TickerRoute"

const AppRouter = () => (
  <HashRouter>
    <Switch>
      <Route path="/ticker/:id" component={TickerRoute} />
      <Route path="/" component={MainRoute} />
    </Switch>
  </HashRouter>
)

export default AppRouter
