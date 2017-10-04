import React from 'react'
import periods from '../data/periods'
import classNames from 'classnames'
import { observer, inject } from 'mobx-react'

const PeriodSwitcher = ({ store }) => (
  <div className="flex br2 ba b--gray-7">
    {periods.map(period => (
      <div className={classNames('pv1 ph2 pointer', { 'bg-gray-7': period === store.period })} onClick={() => store.setPeriod(period)}>{period}</div>
    ))}
  </div>
)

export default inject('store')(observer(PeriodSwitcher))
