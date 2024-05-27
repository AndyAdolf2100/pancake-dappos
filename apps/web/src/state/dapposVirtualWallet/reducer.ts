import { createReducer } from '@reduxjs/toolkit'
import { AddressZero } from 'dappos/constant/constant'
import { updateDappOSVwPolygon, updateDappOSVwManta, updateDappOSVwBalanceInfo, updateDappOSVwIsReady } from './actions'

export interface DappOSVirtualWalletState {
  readonly dappOSVwBalanceInfo: any[]
  readonly dappOSVwIsReady: boolean
  readonly dappOSVwPolygon: string
  readonly dappOSVwManta: string
}

const initialState: DappOSVirtualWalletState = {
  dappOSVwBalanceInfo: [],
  dappOSVwIsReady: false,
  dappOSVwPolygon: AddressZero,
  dappOSVwManta: AddressZero,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateDappOSVwManta, (state, action) => {
      state.dappOSVwManta = action.payload
    })
    .addCase(updateDappOSVwPolygon, (state, action) => {
      state.dappOSVwPolygon = action.payload
    })
    .addCase(updateDappOSVwBalanceInfo, (state, action) => {
      state.dappOSVwBalanceInfo = action.payload
    })
    .addCase(updateDappOSVwIsReady, (state, action) => {
      state.dappOSVwIsReady = action.payload
    }),
)
