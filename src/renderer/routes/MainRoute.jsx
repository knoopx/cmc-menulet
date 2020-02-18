import React from "react"
import { inject, observer } from "mobx-react"
import classNames from "classnames"

import VirtualList from "components/VirtualList"
import Ticker from "components/Ticker"
import MainLayout from "layouts/MainLayout"
import Input from "components/Input"
import PeriodSwitcher from "components/PeriodSwitcher"

const MainRoute = ({ store }) => {
  const renderItem = (ticker) => <Ticker key={ticker.id} ticker={ticker} />

  return (
    <MainLayout>
      <div className="flex flex-none justify-between px-2 py-2 border-b border-gray-7">
        <div
          className={classNames(
            "cursor-pointer border px-2 py-1 rounded border-gray-7 mr-2 flex items-center",
            {
              "bg-gray-7": store.showOnlyHolding,
              "bg-transparent": !store.showOnlyHolding,
            },
          )}
          onClick={store.toggleOnlyHolding}
        >
          HOLD
        </div>
        <Input
          className="hidden sm:block mr-2 px-2 py-1 border border-gray-7 rounded"
          type="search"
          value={store.query}
          placeholder="Filter..."
          onChange={store.setQuery}
        />
        <PeriodSwitcher />
      </div>

      <div className="flex flex-auto overflow-hidden">
        <VirtualList
          items={store.matchingTickers}
          itemHeight={100}
          renderItem={renderItem}
        />
      </div>
    </MainLayout>
  )
}

export default inject("store")(observer(MainRoute))
