import { createReducer } from '@reduxjs/toolkit'
import { updateDappOSWhiteListRawResult, updateWhiteListIsReady, updateDappOSWhiteListResult } from './actions'

export interface DappOSWhiteListState {
  readonly rawResult: any
  readonly result: any
  readonly dappOSWhiteListIsReady: boolean
}

const initialState: DappOSWhiteListState = {
  rawResult: [],
  result: [],
  dappOSWhiteListIsReady: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateDappOSWhiteListRawResult, (state, action) => {
      state.rawResult = action.payload
    })
    .addCase(updateDappOSWhiteListResult, (state, action) => {
      state.result = action.payload
    })
    .addCase(updateWhiteListIsReady, (state, action) => {
      state.dappOSWhiteListIsReady = action.payload
    }),
)
