import { createReducer } from '@reduxjs/toolkit'
import { updateBalanceMap, updateMultiBalanceMap } from './actions'

export interface DappOSWhiteListState {
  readonly currencyBalanceMap: any
}

const initialState: DappOSWhiteListState = {
  currencyBalanceMap: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBalanceMap, (state, action) => {
      const { chainId, key, value } = action.payload
      if (!state.currencyBalanceMap[chainId]) {
        state.currencyBalanceMap[chainId] = {}
      }
      state.currencyBalanceMap[chainId][key] = value
    })
    .addCase(updateMultiBalanceMap, (state, action) => {
      const { chainId, keys, values } = action.payload
      console.log('keys, values', keys, values)
      keys.forEach((key, i) => {
        if (!state.currencyBalanceMap[chainId]) {
          state.currencyBalanceMap[chainId] = {}
        }
        state.currencyBalanceMap[chainId][key] = values[i]
      })
    }),
)
