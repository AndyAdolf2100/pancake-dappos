import { createReducer } from '@reduxjs/toolkit'
import { DappOSProtocol } from '@dappos/checkout'
import { DappOSWalletLite } from '@dappos/wallet-lite'
import { AddressZero } from 'dappos/constant/constant'
import {
  updateDappOSProtocol,
  updateDappOSProtocolIsReady,
  updatePaydbAddress,
  updateDstChainId,
  updateDappOSWalletLite,
} from './actions'

export interface DappOSProtocolState {
  readonly dappOSProtocol: DappOSProtocol | null
  readonly dappOSWalletLite: DappOSWalletLite | null
  readonly isProtocolReady: boolean
  readonly paydbAddress: string | null
  readonly dstChainId: number
}

const initialState: DappOSProtocolState = {
  dappOSProtocol: null,
  dappOSWalletLite: null,
  isProtocolReady: false, // for connection operation
  paydbAddress: AddressZero,
  dstChainId: 42161, // default is arbitrium (42161)
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateDappOSProtocol, (state, action) => {
      state.dappOSProtocol = action.payload as any
    })
    .addCase(updateDappOSWalletLite, (state, action) => {
      state.dappOSWalletLite = action.payload as any
    })
    .addCase(updateDappOSProtocolIsReady, (state, action) => {
      state.isProtocolReady = action.payload
    })
    .addCase(updatePaydbAddress, (state, action) => {
      state.paydbAddress = action.payload
    })
    .addCase(updateDstChainId, (state, action) => {
      state.dstChainId = action.payload
    }),
)
