import React from 'react'
import { Motion, spring } from 'react-motion'

export default ({ children }) => (
  <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1) }}>
    {style => <div style={style}>{children}</div> }
  </Motion>
)
