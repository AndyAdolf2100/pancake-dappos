import { createAction } from '@reduxjs/toolkit'

export const updateProcess = createAction<any>('dappTransaction/updateProcess')

export const updateIsPolling = createAction<boolean>('dappTransaction/updateIsPolling')

export const updatePendingCount = createAction<number>('dappTransaction/updatePendingCount')

export const shiftTransaction = createAction('dappTransaction/shiftTransaction')

export const pushTransaction = createAction<any>('dappTransaction/pushTransaction')

export const updateHashSet = createAction<string>('dappTransaction/updateHashSet')

export const deleteHashSet = createAction<string>('dappTransaction/deleteHashSet')
