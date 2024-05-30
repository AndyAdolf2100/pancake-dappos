import { createAction } from '@reduxjs/toolkit'

// TODO need add type
export const updateDappOSWhiteListRawResult = createAction<any>('dappWhiteList/updateDappOSWhiteListRawResult')

export const updateDappOSWhiteListResult = createAction<any>('dappWhiteList/updateDappOSWhiteListResult')

export const updateWhiteListIsReady = createAction<boolean>('dappVirtualWallet/updateWhiteListIsReady')
