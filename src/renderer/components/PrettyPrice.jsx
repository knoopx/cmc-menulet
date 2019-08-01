import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { getLocaleRegion } from 'support/formatting'

const PrettyPrice = ({
  amount, suffix, ...props
}) => {
  const formatter = new Intl.NumberFormat(getLocaleRegion(), {
    ...(suffix && {
      style: 'currency',
      currency: suffix,
    }),
    // maximumSignificantDigits: 6,
    // maximumFractionDigits: 2,
  })

  const parts = formatter.formatToParts(amount)

  return (
    <span {...props}>
      {parts.map((part, i) => (
        <span
          key={i}
          className={classNames('whitespace-no-wrap', {
            'opacity-25': ((part.type === 'integer' || part.type === 'decimal') && amount < 1),
            'opacity-50': ((part.type === 'fraction' || part.type === 'decimal') && amount >= 1),
            'font-hairline': part.type === 'currency',
          })}
        >
          {part.value}
        </span>
      ))}
    </span>
  )
}

PrettyPrice.propTypes = {
  amount: PropTypes.number.isRequired,
}

export default PrettyPrice
