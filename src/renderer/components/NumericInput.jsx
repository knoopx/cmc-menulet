import React, { useState } from "react"

import Input from "./Input"

const NumericInput = ({ value: initialValue, onChange, ...props }) => {
  const [value, setValue] = useState(initialValue)

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        onChange(e)
      }}
    />
  )
}

export default NumericInput
