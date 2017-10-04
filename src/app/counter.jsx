import React from 'react'
import { gray } from 'open-color'
import { observer } from 'mobx-react'

const Arc = ({ size, percent, strokeWidth, style }) => {
  const radius = (size / 2) - (strokeWidth / 2)
  const circumference = 2 * Math.PI * radius

  return (
    <circle
      r={radius}
      cx="50%"
      cy="50%"
      size={size}
      strokeWidth={strokeWidth}
      style={{
        ...style,
        transition: 'stroke-dasharray .3s ease',
        transform: 'rotate(-90deg) scale(1,-1)',
        transformOrigin: 'center',
        strokeDasharray: `${percent * circumference} ${circumference}`,
        fill: 'none',
        strokeWidth,
      }}
    />
  )
}

const Counter = observer(({ percent, size }) => {
  const strokeWidth = size / 3

  return (
    <svg width={size} height={size}>
      <Arc
        size={size}
        percent={1}
        strokeWidth={strokeWidth}
        style={{
          stroke: gray[7],
        }}
      />

      <Arc
        size={size}
        percent={percent}
        strokeWidth={strokeWidth}
        style={{
          stroke: gray[6],
          transition: 'stroke-dasharray .3s ease',
        }}
      />
    </svg>
  )
})

export default Counter
