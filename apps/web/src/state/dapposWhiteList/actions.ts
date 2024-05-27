import { createAction } from '@reduxjs/toolkit'

// TODO need add type
export const updateDappOSWhiteListRawResult = createAction<any>('dappWhiteList/updateDappOSWhiteListRawResult')

export const updateWhiteListIsReady = createAction<boolean>('dappVirtualWallet/updateWhiteListIsReady')
