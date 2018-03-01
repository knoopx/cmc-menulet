import React from 'react'
import periods from '../data/periods'
import classNames from 'classnames'
import { observer, inject } from 'mobx-react'

const PeriodSwitcher = ({ store, className }) => (
  <div
    className={classNames('flex br2 ba b--gray-7 f6 items-center', className)}
  >
    {periods.map(period => (
      <div
        className={classNames('pv1 ph2 pointer', {
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
