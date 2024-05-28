import { createReducer } from '@reduxjs/toolkit'
import { AddressZero } from 'dappos/constant/constant'
import {
  updateDappOSVwEthereum,
  updateDappOSVwBase,
  updateDappOSVwArbitrum,
  updateDappOSVwBinanceSmart,
  updateDappOSVwBalanceInfo,
  updateDappOSVwIsReady,
} from './actions'

export interface DappOSVirtualWalletState {
  readonly dappOSVwBalanceInfo: any[]
  readonly dappOSVwIsReady: boolean
  readonly dappOSVwArbitrum: string
  readonly dappOSVwBinanceSmart: string
  readonly dappOSVwBase: string
  readonly dappOSVwEthereum: string
}

const initialState: DappOSVirtualWalletState = {
  dappOSVwBalanceInfo: [],
  dappOSVwIsReady: false,
  dappOSVwArbitrum: AddressZero,
  dappOSVwBinanceSmart: AddressZero,
  dappOSVwBase: AddressZero,
  dappOSVwEthereum: AddressZero,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateDappOSVwArbitrum, (state, action) => {
      state.dappOSVwArbitrum = action.payload
    })
    .addCase(updateDappOSVwBinanceSmart, (state, action) => {
      state.dappOSVwBinanceSmart = action.payload
    })
    .addCase(updateDappOSVwBase, (state, action) => {
      state.dappOSVwBase = action.payload
    })
    .addCase(updateDappOSVwEthereum, (state, action) => {
      state.dappOSVwEthereum = action.payload
    })
    .addCase(updateDappOSVwBalanceInfo, (state, action) => {
      state.dappOSVwBalanceInfo = action.payload
    })
    .addCase(updateDappOSVwIsReady, (state, action) => {
      state.dappOSVwIsReady = action.payload
    }),
)
