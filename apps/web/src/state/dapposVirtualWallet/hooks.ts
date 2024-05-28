import { useCallback, useMemo } from 'react'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { useDappOSProtocol, useDappOSProtocolIsReady } from 'state/dappos/hooks'
import {
  updateDappOSVwBalanceInfo,
  updateDappOSVwIsReady,
  updateDappOSVwArbitrum,
  updateDappOSVwBinanceSmart,
  updateDappOSVwBase,
  updateDappOSVwEthereum,
} from './actions'

export const useDappOSVwBalanceInfo = () => {
  const { eoaAccount: account } = useAccountActiveChain()
  const { dappOSProtocol } = useDappOSProtocol()
  const { isProtocolReady } = useDappOSProtocolIsReady()
  const dappOSVwBalanceInfo = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwBalanceInfo)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback(async () => {
    if (!isProtocolReady || !dappOSProtocol) {
      console.error("protocol hasn't been ready ")
      return
    }
    if (!account) {
      console.error("account hasn't been initialized")
      return
    }
    const list = await dappOSProtocol.getTokenWhiteListBalance(account)

    dispatch(updateDappOSVwBalanceInfo(list))
  }, [account, dappOSProtocol, isProtocolReady, dispatch])

  const vwBalanceOf = (tokenAddress: string, chainId: number) => {
    const tokenVwInfo = dappOSVwBalanceInfo.find(
      (e) =>
        e.whitelists &&
        e.whitelists.find(
          (c: { chainId: number; tokenAddress: string }) =>
            c.chainId === Number(chainId) && c.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
        ),
    )
    // console.log('tokenVwInfo: ', tokenVwInfo)
    return (tokenVwInfo && tokenVwInfo.balance) || '0'
  }

  return {
    dappOSVwBalanceInfo,
    update,
    vwBalanceOf,
  }
}

export const useDappOSVwIsReady = () => {
  const isVwReady = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwIsReady)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((status: boolean) => dispatch(updateDappOSVwIsReady(status)), [dispatch])

  return {
    isVwReady,
    update,
  }
}

export const useDappOSVirtualWallet = () => {
  const dappOSVwArbitrum = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwArbitrum)
  const dappOSVwEthereum = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwEthereum)
  const dappOSVwBase = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwBase)
  const dappOSVwBinanceSmart = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwBinanceSmart)

  const dstChainId = useSelector((state: AppState) => state.dappOS.dstChainId)

  const dispatch = useDispatch<AppDispatch>()
  const updateArbitrum = useCallback(
    (address: string) => {
      dispatch(updateDappOSVwArbitrum(address))
    },
    [dispatch],
  )

  const updateEthereum = useCallback(
    (address: string) => {
      dispatch(updateDappOSVwEthereum(address))
    },
    [dispatch],
  )

  const updateBinanceSmart = useCallback(
    (address: string) => {
      dispatch(updateDappOSVwBinanceSmart(address))
    },
    [dispatch],
  )

  const updateBase = useCallback(
    (address: string) => {
      dispatch(updateDappOSVwBase(address))
    },
    [dispatch],
  )

  const currentVwAddress = useMemo(() => {
    if (dstChainId === 42161) {
      return dappOSVwArbitrum
      // eslint-disable-next-line no-else-return
    } else if (dstChainId === 56) {
      return dappOSVwBinanceSmart
    } else if (dstChainId === 1) {
      return dappOSVwEthereum
    } else {
      return dappOSVwBase
    }
  }, [dappOSVwArbitrum, dstChainId, dappOSVwBase, dappOSVwBinanceSmart, dappOSVwEthereum])

  return {
    currentVwAddress,
    updateArbitrum,
    updateEthereum,
    updateBinanceSmart,
    updateBase,
  }
}
