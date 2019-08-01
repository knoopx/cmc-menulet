import React from 'react'
import classNames from 'classnames'
import { observer, inject } from 'mobx-react'
import periods from '../data/periods'

const PeriodSwitcher = ({ store, className }) => (
  <div
    className={classNames(
      'flex rounded border border-gray-7 text-sm items-center',
      className,
    )}
  >
    {periods.map(period => (
      <div
        key={period}
        className={classNames('flex py-1 px-2 cursor-pointer', {
          'bg-gray-7': period === store.period,
        })}
        onClick={() => store.setPeriod(period)}
      >
        {period}
      </div>
    ))}
  </div>
)

export default inject('store')(observer(PeriodSwitcher))
