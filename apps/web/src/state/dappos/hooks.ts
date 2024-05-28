import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { DappOSWalletLite } from '@dappos/wallet-lite'
import { DappOSProtocol } from '@dappos/checkout'
import {
  updateDappOSProtocol,
  updateDappOSProtocolIsReady,
  updatePaydbAddress,
  updateDstChainId,
  updateDappOSWalletLite,
} from './actions'

export const useDappOSProtocol = () => {
  const dappOSProtocol = useSelector((state: AppState) => state.dappOS.dappOSProtocol)

  const isProtocolReady = useSelector((state: AppState) => state.dappOS.isProtocolReady)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((protocol: DappOSProtocol) => dispatch(updateDappOSProtocol(protocol)), [dispatch])

  const readyProtocol = useCallback(() => {
    return new Promise((resolve) => {
      if (isProtocolReady) {
        resolve(dappOSProtocol)
      }
    })
  }, [dappOSProtocol, isProtocolReady])

  return {
    dappOSProtocol,
    readyProtocol,
    update,
  }
}

export const useDappOSWalletLite = () => {
  const dappOSWalletLite = useSelector((state: AppState) => state.dappOS.dappOSWalletLite)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((walletLite: DappOSWalletLite) => dispatch(updateDappOSWalletLite(walletLite)), [dispatch])

  return {
    dappOSWalletLite,
    update,
  }
}

export const useDappOSProtocolIsReady = () => {
  const isProtocolReady = useSelector((state: AppState) => state.dappOS.isProtocolReady)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((status: boolean) => dispatch(updateDappOSProtocolIsReady(status)), [dispatch])

  return {
    isProtocolReady,
    update,
  }
}

export const usePaydbAddress = () => {
  const paydbAddress = useSelector((state: AppState) => state.dappOS.paydbAddress)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((address: string) => dispatch(updatePaydbAddress(address)), [dispatch])
  return {
    paydbAddress,
    update,
  }
}

export const useDstChainId = () => {
  const dstChainId = useSelector((state: AppState) => state.dappOS.dstChainId)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((chainId: number) => dispatch(updateDstChainId(chainId)), [dispatch])
  return {
    dstChainId,
    update,
  }
}
