import { createReducer } from '@reduxjs/toolkit'
import { updateDappOSWhiteListRawResult, updateWhiteListIsReady } from './actions'

export interface DappOSWhiteListState {
  readonly rawResult: any
  readonly dappOSWhiteListIsReady: boolean
}

const initialState: DappOSWhiteListState = {
  rawResult: [],
  dappOSWhiteListIsReady: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateDappOSWhiteListRawResult, (state, action) => {
      state.rawResult = action.payload
    })
    .addCase(updateWhiteListIsReady, (state, action) => {
      state.dappOSWhiteListIsReady = action.payload
    }),
)
