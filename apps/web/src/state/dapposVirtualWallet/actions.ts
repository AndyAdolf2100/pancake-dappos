import { createAction } from '@reduxjs/toolkit'

// TODO need add type
export const updateDappOSVwBalanceInfo = createAction<any[]>('dappVirtualWallet/updateDappOSVwBalanceInfo')

export const updateDappOSVwIsReady = createAction<boolean>('dappVirtualWallet/updateDappOSVwIsReady')

export const updateDappOSVwManta = createAction<string>('dappVirtualWallet/updateDappOSVwManta')

export const updateDappOSVwPolygon = createAction<string>('dappVirtualWallet/updateDappOSVwPolygon')
