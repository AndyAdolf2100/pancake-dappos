import { useCallback, useMemo } from 'react'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { useDappOSProtocol, useDappOSProtocolIsReady } from 'state/dappos/hooks'
import { updateDappOSVwBalanceInfo, updateDappOSVwIsReady, updateDappOSVwPolygon, updateDappOSVwManta } from './actions'

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
  const dappOSVwManta = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwManta)
  const dappOSVwPolygon = useSelector((state: AppState) => state.dappOSVirtualWallet.dappOSVwPolygon)

  const dstChainId = useSelector((state: AppState) => state.dappOS.dstChainId)

  const dispatch = useDispatch<AppDispatch>()
  const updateManta = useCallback(
    (address: string) => {
      dispatch(updateDappOSVwManta(address))
    },
    [dispatch],
  )

  const updatePolygon = useCallback(
    (address: string) => {
      dispatch(updateDappOSVwPolygon(address))
    },
    [dispatch],
  )

  const currentVwAddress = useMemo(() => {
    if (dstChainId === 169) {
      return dappOSVwManta
      // eslint-disable-next-line no-else-return
    } else {
      return dappOSVwPolygon
    }
  }, [dappOSVwManta, dappOSVwPolygon, dstChainId])

  return {
    currentVwAddress,
    dappOSVwManta,
    dappOSVwPolygon,
    updateManta,
    updatePolygon,
  }
}
