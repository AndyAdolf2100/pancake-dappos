import { AddressZero } from 'dappos/constant/constant'
import dayjs from 'dayjs'

export const isVwValid = (vwAddress: string) => {
  return vwAddress !== AddressZero
}

export const getExpTime = () => {
  return Math.floor((new Date().getTime() + 60 * 60 * 24 * 1000) / 1000)
}

export const appVersion = dayjs(process.env.APP_VERSION).toString()

export const doFnExceptInIframe = (fn: any, iframeMessage: string | undefined) => {
  if (window.parent.location !== window.location) {
    // it is in iframe
    window.top?.postMessage(iframeMessage, '*')
  } else {
    // it is not
    fn()
    // ;
  }
}
