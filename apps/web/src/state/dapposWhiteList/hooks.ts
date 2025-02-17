import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { useCallback } from 'react'
import axios from 'axios'
import { loadingInitialized } from 'dappos/utils/loading'
import { updateDappOSWhiteListRawResult, updateDappOSWhiteListResult, updateWhiteListIsReady } from './actions'

const { loading, startLoading, endLoading } = loadingInitialized()

export const useDappOSWhiteList = () => {
  const { result, update: updateResult } = useWhiteListResult()
  const { rawResult, update: updateRawResult } = useWhiteListRawResult()
  const { isWhiteListReady, update: updateIsReady } = useWhiteListIsReady()

  const loadWhiteList = async () => {
    if (loading || isWhiteListReady) return
    startLoading()
    const url = `${process.env.NEXT_PUBLIC_DAPPOS_SUPER_ADMIN}/supernodeadmin/v2/token_whitelists`
    const config = {
      params: {},
    }
    const res = await axios.get(url, config)
    const data = res.data.flatMap(({ price, icon, whitelists }: { price: any; icon: any; whitelists: any }) => {
      return whitelists.map((i: any) => {
        return Object.assign(i ?? {}, { price, icon })
      })
    })
    updateResult(data)
    updateRawResult(res.data)
    updateIsReady(true)
    endLoading()
  }

  const getRawResult = useCallback(() => {
    return new Promise((resolve) => {
      if (isWhiteListReady) {
        resolve(rawResult)
      } else {
        resolve([])
      }
    })
  }, [isWhiteListReady, rawResult])

  const getResult = useCallback(() => {
    return new Promise((resolve) => {
      if (isWhiteListReady) {
        resolve(result)
      } else {
        resolve([])
      }
    })
  }, [isWhiteListReady, result])

  const getWhiteTokenList = async () => {
    const rawRes: any = await getResult()
    if (rawRes.length === 0) return []
    return rawRes
  }

  /**
   *
   * @param {*} sourceAddress
   * @param {*} sourceChainId
   * @returns
   */
  const findCurrency = async (sourceAddress?: string, sourceChainId?: number) => {
    const whiteList = await getWhiteTokenList()
    const currency = whiteList.find(
      (i: any) =>
        i.tokenAddress?.toLowerCase() === sourceAddress?.toLowerCase() && Number(i.chainId) === Number(sourceChainId),
    )
    return currency
  }

  /**
   *
   * @param {*} targetChainId
   * @param {*} sourceCurrency sourceCurrency initialized by findCurrency method
   * @returns
   */
  const findTargetChainCurrency = async (targetChainId: number, sourceCurrency: any) => {
    const { tokenClassId } = sourceCurrency
    const raw: any = await getRawResult()
    const whiteLists = raw.find((i: any) => i.id === tokenClassId).whitelists ?? []
    const currency = whiteLists.find((i: any) => i.chainId === targetChainId)
    return findCurrency(currency?.tokenAddress, currency?.chainId)
  }

  return {
    findCurrency,
    findTargetChainCurrency,
    loadWhiteList,
  }
}

const useWhiteListRawResult = () => {
  const rawResult = useSelector((state: AppState) => state.dappOSWhiteList.rawResult)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback(
    (raw: any) => {
      dispatch(updateDappOSWhiteListRawResult(raw))
    },
    [dispatch],
  )

  return {
    rawResult,
    update,
  }
}

const useWhiteListResult = () => {
  const result = useSelector((state: AppState) => state.dappOSWhiteList.result)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback(
    (raw: any) => {
      dispatch(updateDappOSWhiteListResult(raw))
    },
    [dispatch],
  )

  return {
    result,
    update,
  }
}

const useWhiteListIsReady = () => {
  const isWhiteListReady = useSelector((state: AppState) => state.dappOSWhiteList.dappOSWhiteListIsReady)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback(
    (status: boolean) => {
      dispatch(updateWhiteListIsReady(status))
    },
    [dispatch],
  )
  return {
    isWhiteListReady,
    update,
  }
}
