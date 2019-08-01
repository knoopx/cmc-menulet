import React from 'react'
import classNames from 'classnames'

const Input = ({ className, ...props }) => (
  <input className={classNames("flex flex-auto appearance-none outline-none color-inherit bg-transparent", className)} {...props} />
)

export default Input
