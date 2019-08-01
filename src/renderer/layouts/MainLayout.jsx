import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import PrettyPrice from 'components/PrettyPrice'
import PrettyPercent from 'components/PrettyPercent'
import baseCurrencies from 'data/baseCurrencies'
import { MdArrowBack } from 'react-icons/md'
import Spinner from 'components/Spinner'
import Counter from 'components/Counter'

const MainLayout = ({ store, children, match }) => (
  <div className="sans-serif text-gray-5 bg-gray-8 h-screen overflow-hidden flex flex-auto flex-col leading-none">
    <div className="flex flex-none px-4 py-2 border-b border-gray-7 items-center">
      {match.path === '/' ? (
        <div className="flex flex-auto items-center">
          {store.isFetching ? (
            <Spinner size={24} className="bg-gray-5" />
          ) : (
            <Counter
              size={24}
              percent={store.remainingTime / store.refreshInterval}
            />
          )}
        </div>
      ) : <Link className="no-underline text-gray-5" to="/"><MdArrowBack size="1.5em" /></Link>}

      <div className="flex flex-row items-center justify-center w-10/12 ml-auto">
        <PrettyPrice
          className="text-2xl mr-3"
          amount={store.portfolioValue}
        />
        <select
          className="appearance-none outline-none color-inherit border-none bg-transparent text-base cursor-pointer mt-1 p-0"
          defaultValue={store.baseCurrency}
          onChange={e => store.setBaseCurrency(e.target.value)}
        >
          {baseCurrencies.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col items-end text-xs w-1/12 leading-normal">
        <PrettyPercent value={store.portfolioChange1h} suffix="1H" />
        <PrettyPercent value={store.portfolioChange1d} suffix="1D" />
        <PrettyPercent value={store.portfolioChange7d} suffix="7D" />
      </div>
    </div>
    {children}
  </div>
)

export default withRouter(inject('store')(observer(MainLayout)))
