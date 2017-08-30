import React from 'react'
import Numeral from 'numeral'
import classNames from 'classnames'

const PrettyPercent = ({ value }) => (
  value ? (<span className={classNames({ 'green-5': value > 0, 'red-5': value < 0 })}>{value > 0 ? '+' : ''}{Numeral(value).format('0.00')}%</span>) : <span className="gray-6">–</span>
)

export default PrettyPercent
