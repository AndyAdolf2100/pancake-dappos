import { createAction } from '@reduxjs/toolkit'
import { DappOSProtocol } from '@dappos/checkout'

export const updateDappOSProtocol = createAction<DappOSProtocol>('dappOSProtocol/updateDappOSProtocol')

export const updatePaydbAddress = createAction<string>('dappOSProtocol/updatePaydbAddress')

export const updateDappOSProtocolIsReady = createAction<boolean>('dappOSProtocol/updateDappOSProtocolIsReady')

export const updateDstChainId = createAction<number>('dappOSProtocol/updateDstChainId')
