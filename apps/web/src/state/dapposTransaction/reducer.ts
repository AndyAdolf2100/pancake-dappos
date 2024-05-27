import { createReducer } from '@reduxjs/toolkit'
import {
  updateProcess,
  updateIsPolling,
  updatePendingCount,
  shiftTransaction,
  pushTransaction,
  updateHashSet,
  deleteHashSet,
} from './actions'

export interface TransactionState {
  readonly isPolling: boolean
  readonly process: any | number
  readonly pendingCount: number
  readonly transactions: any[]
  readonly hashSet: any
}

const initialState: TransactionState = {
  isPolling: false,
  process: 0,
  pendingCount: 0,
  transactions: [],
  hashSet: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateProcess, (state, action) => {
      state.process = action.payload
    })
    .addCase(updateIsPolling, (state, action) => {
      state.isPolling = action.payload
    })
    .addCase(updatePendingCount, (state, action) => {
      state.pendingCount = action.payload
    })
    .addCase(shiftTransaction, (state) => {
      return state.transactions.shift()
    })
    .addCase(pushTransaction, (state, action) => {
      state.transactions.push(action.payload)
    })
    .addCase(updateHashSet, (state, action) => {
      state.hashSet[action.payload] = true
    })
    .addCase(deleteHashSet, (state, action) => {
      delete state.hashSet[action.payload]
    }),
)
