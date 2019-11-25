import { useEffect } from "react"

let counter = 0

export default function useUniqueId() {
  useEffect(() => {
    counter += 1
    return () => {
      counter -= 1
    }
  })
}
