import { remote } from 'electron'

export function getLocaleRegion() {
  return remote.app.getLocaleCountryCode()
}

export function formatNumber(number, decimals) {
  return number.toLocaleString(getLocaleRegion(), { maximumFractionDigits: decimals })
}
