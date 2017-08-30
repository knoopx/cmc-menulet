import React from 'react'
import { gray } from 'open-color'
import { observer } from 'mobx-react'
import { now } from 'mobx-utils'

const Counter = observer(({ startedAt, duration, size }) => {
  const elapsed = now() - startedAt
  const remaining = duration - elapsed
  const radius = size / 2
  const circumference = Math.PI * (radius * 2)

  return (
    <svg width={size} height={size}>
      <defs >
        <circle
          id="circle"
          r="40%"
          cx="50%"
          cy="50%"
          transform={`scale(-1, 1) translate(-${size}, 0) rotate(-90 ${radius} ${radius})`}
          style={{
            strokeWidth: '50%',
            fill: 'none',
          }}
        />
        <clipPath id="clip">
          <use xlinkHref="#circle" />
        </clipPath>
      </defs>

      <use
        xlinkHref="#circle"
        clipPath="url(#clip)"
        style={{ stroke: gray[7] }}
      />
      <use
        xlinkHref="#circle"
        clipPath="url(#clip)"
        style={{
          transition: 'stroke-dasharray .3s ease',
          strokeDasharray: `${remaining / duration * circumference} ${circumference}`,
          stroke: gray[6],
        }}
      />
    </svg>
  )
})

export default Counter
