import { createReducer } from '@reduxjs/toolkit'

export interface DappOSInstitutionState {
  readonly isSwapModeNormal: boolean
  institutionAccount: undefined
  institutionAccountId: undefined
}

const initialState: DappOSInstitutionState = {
  isSwapModeNormal: true,
  institutionAccount: undefined,
  institutionAccountId: undefined,
}

export default createReducer(initialState, (builder) => builder)
