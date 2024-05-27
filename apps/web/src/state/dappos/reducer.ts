import { createReducer } from '@reduxjs/toolkit'
import { DappOSProtocol } from '@dappos/checkout'
import { AddressZero } from 'dappos/constant/constant'
import { updateDappOSProtocol, updateDappOSProtocolIsReady, updatePaydbAddress, updateDstChainId } from './actions'

export interface DappOSProtocolState {
  readonly dappOSProtocol: DappOSProtocol | null
  readonly isProtocolReady: boolean
  readonly paydbAddress: string | null
  readonly dstChainId: number
}

const initialState: DappOSProtocolState = {
  dappOSProtocol: null,
  isProtocolReady: false, // for connection operation
  paydbAddress: AddressZero,
  dstChainId: 42161, // default is arbitrium (42161)
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateDappOSProtocol, (state, action) => {
      state.dappOSProtocol = action.payload as any
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
