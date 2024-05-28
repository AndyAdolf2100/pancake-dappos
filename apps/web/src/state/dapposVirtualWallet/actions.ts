import { createAction } from '@reduxjs/toolkit'

// TODO need add type
export const updateDappOSVwBalanceInfo = createAction<any[]>('dappVirtualWallet/updateDappOSVwBalanceInfo')

export const updateDappOSVwIsReady = createAction<boolean>('dappVirtualWallet/updateDappOSVwIsReady')

export const updateDappOSVwBinanceSmart = createAction<string>('dappVirtualWallet/updateDappOSVwBinanceSmart')

export const updateDappOSVwArbitrum = createAction<string>('dappVirtualWallet/updateDappOSVwArbitrum')

export const updateDappOSVwBase = createAction<string>('dappVirtualWallet/updateDappOSVwBase')

export const updateDappOSVwEthereum = createAction<string>('dappVirtualWallet/updateDappOSVwEthereum')
