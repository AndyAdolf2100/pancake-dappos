import { createReducer } from '@reduxjs/toolkit'
import { updateBalanceMap } from './actions'

export interface DappOSWhiteListState {
  readonly currencyBalanceMap: any
}

const initialState: DappOSWhiteListState = {
  currencyBalanceMap: {},
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateBalanceMap, (state, action) => {
    const { chainId, key, value } = action.payload
    if (!state.currencyBalanceMap[chainId]) {
      state.currencyBalanceMap[chainId] = {}
    }
    state.currencyBalanceMap[chainId][key] = value
  }),
)
