import React from 'react'
import classNames from 'classnames'
import { getLocaleRegion } from 'support/formatting'

const PrettyPercent = ({
  value, suffix, className, ...props
}) => {
  const formatter = new Intl.NumberFormat(getLocaleRegion(), {
    style: 'percent',
    maximumFractionDigits: 2,
    maximumSignificantDigits: 3,
  })
  const parts = formatter.formatToParts(value / 100)

  return (
    <span
      className={classNames(className, 'whitespace-no-wrap', {
        'text-green-5': value > 0,
        'text-red-5': value < 0,
      })}
      {...props}
    >
      {value ? (
        <React.Fragment>
          {value > 0 && <span>+</span>}
          {parts.map((part, i) => (
            <span
              key={i}
            >
              {part.value}
            </span>
          ))}
        </React.Fragment>
      ) : <span className="text-gray-6">–</span>}

      {suffix && <span className="ml-1 text-gray-6 font-hairline">{suffix}</span>}
    </span>
  )
}
export default PrettyPercent
