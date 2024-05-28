import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { useDappOSProtocol } from 'state/dappos/hooks'
// import { useAddPopup, useRemovePopup } from 'state/application/hooks'
import { useCallback, useMemo } from 'react'
import { ERROR_CODE } from 'dappos/constant/error-code'
import { calculateOrderProgress } from 'dappos/utils/order-progress'
import axios from 'axios'
import { getProvider, getVirtualWallet } from 'dappos/utils/getVirtualWallet'
import {
  updateProcess as updateProcessAction,
  updateIsPolling as updateIsPollingAction,
  updatePendingCount as updatePendingCountAction,
  shiftTransaction as shiftTransactionAction,
  pushTransaction as pushTransactionAction,
  updateHashSet as updateHashSetAction,
  deleteHashSet as deleteHashSetAction,
} from './actions'
import { IOrderInfo, PollOrderRes, ITxs } from '../../dappos/constant/order-types'

const BASE_URL = process.env.NEXT_PUBLIC_DAPPOS_RPC_URL

export const useDappOSTransaction = () => {
  const { eoaAccount, chainId } = useAccountActiveChain()
  const { update: updateProcess } = useProcess()
  const { isPolling, update: updateIsPolling } = useIsPolling()
  const { pendingCount, update: updatePendingCount } = usePendingCount()
  const { transactions, push: pTransaction, shift: sTransaction } = useTransactions()
  const { hashSet, update: updateHashSet, del: deleteHashSet } = useHashSet()
  const { dappOSProtocol } = useDappOSProtocol()

  // const addPopup = useAddPopup()
  // const removePopup = useRemovePopup()
  // const removePopup = useRemovePopup();

  const setTransactionProcess = (val: number | string) => {
    updateProcess(val)
  }
  const transactionStart = () => {
    updateIsPolling(true)
    updateProcess(0)
  }

  const transactionFinish = () => {
    updateIsPolling(false)
    updateProcess(100)
  }

  const pushTransaction = (hash: string, options: any) => {
    if (!hashSet[hash]) {
      updatePendingCount(pendingCount + 1)
      updateHashSet(hash)
      pTransaction({
        hash,
        options,
      })
    }
  }

  const shiftTransaction = () => {
    const hash = transactions[0]?.hash
    if (hash) {
      sTransaction()
      deleteHashSet(hash)
    }
    updatePendingCount(transactions.length)
    if (transactions.length) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { hash, options } = transactions[0]
      pollOrderHash(hash, options)
    }
  }

  const getOrderInfo = async (orderHash: string): Promise<IOrderInfo> => {
    const url = `${BASE_URL}/supernode/v2/orders/action/get_order_by_hash`
    const params = { order_hash: orderHash }
    return axios.get<IOrderInfo>(url, { params }).then((res) => {
      return res.data
    })
  }

  const getOrderProgress = (txs: ITxs[] = []) => {
    const stateMap = txs
      ?.flatMap((e) => [
        e.vw?.state,
        ...(e.createPays ?? []).map((p) => p?.state),
        ...(e.executePays ?? []).map((p) => p?.state),
      ])
      .filter((e) => e !== undefined) as number[]
    const isSuccess = stateMap?.every((e) => e === 3)
    const failureState = stateMap?.find((e) => [4, 5].includes(e))
    if (isSuccess) {
      return {
        state: 3,
        isSuccess,
        isFailure: false,
        progress: 100,
      }
    }
    if (failureState) {
      const failureCodeList = txs
        .flatMap((e) => [
          e.vw?.failureReason,
          ...(e.createPays ?? []).map((p) => p?.failureReason),
          ...(e.executePays ?? []).map((p) => p?.failureReason),
        ])
        .filter((e) => e !== undefined && e !== '')
      const errorReason = failureCodeList.find((t) => !!ERROR_CODE[t])
      const failureReason = errorReason || failureCodeList.find((t) => t) || 'failed' || ''
      return {
        state: failureState,
        isSuccess: false,
        isFailure: !!failureState,
        progress: 100,
        failureReason,
      }
    }

    return {
      isSuccess: false,
      isFailure: false,
      progress: calculateOrderProgress(txs),
      state: 2,
    }
  }

  const pollResDeal = (data: IOrderInfo) => {
    const txs = data?.txs || []
    const { progress, state, isSuccess, isFailure, failureReason = '' } = getOrderProgress(txs)
    console.log('current progress：', progress)

    return {
      data,
      state,
      progress,
      isSuccess,
      isFailure,
      isEnd: isSuccess || isFailure,
      failureReason,
    }
  }

  /**
   * loop function
   * @param orderHash - order hash
   * @param interval - millisecond
   * @param maxAttempts - max try times
   * @returns undefined
   */
  const pollOrderHash = async (
    orderHash: string,
    options?: any,
  ): Promise<(PollOrderRes & { lastTxHash: undefined | string }) | undefined> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const dstChainId = chainId
      const activeWallet = await getVirtualWallet(eoaAccount!, dstChainId)
      let lastTxHash
      // TODO for institution signer
      // if (typeof orderHash === 'boolean' && orderHash) {
      //   orderTextNotify('success');
      //   resolve({
      //     state: 3,
      //     data: { orderHash: true, txs: [], sender: '' },
      //     isSuccess: true,
      //     isEnd: true,
      //     isFailure: false,
      //     progress: 100,
      //     failureReason: '',
      //   });
      //   return;
      // }
      pushTransaction(orderHash, options)
      if (isPolling || !dappOSProtocol) return
      const interval = options?.interval || 400
      const maxAttempts = options?.maxAttempts || 999
      transactionStart()
      let attempts = 0
      let timer: NodeJS.Timeout | null | any
      const poll = async () => {
        // eslint-disable-next-line no-unused-expressions
        timer ? clearTimeout(timer) : null
        const result = await getOrderInfo(orderHash)
        const pollOrderRes = pollResDeal(result)
        setTransactionProcess(pollOrderRes.progress)
        if (pollOrderRes.isEnd) {
          console.log('looping searching result：', pollOrderRes.isSuccess)
          if (pollOrderRes.isSuccess) {
            const condition = result.txs.some((tx) => !!tx.vw && tx.vw.chainId === dstChainId)
            if (condition) {
              const txArr = result.txs.filter((tx) => !!tx.vw && tx.vw.chainId === dstChainId)
              await getProvider(dstChainId).waitForTransaction(txArr[txArr.length - 1].vw.hash, 1)
              lastTxHash = txArr[txArr.length - 1].vw.hash
            }
            // reload vw balance
            if (activeWallet?.walletCreated) {
              await dappOSProtocol.updateAssets()
            } else {
              getVirtualWallet(eoaAccount!, dstChainId, {
                cache: false,
              })
              await dappOSProtocol.updateAllAccountAsset()
            }
          }
          const hash = orderHash
          // TODO notification
          // addPopup(
          //   {
          //     txn: {
          //       hash,
          //       success: pollOrderRes.isSuccess,
          //       summary: pollOrderRes.isSuccess ? undefined : pollOrderRes.failureReason,
          //     },
          //   },
          //   hash,
          //   null,
          // )
          // setTimeout(() => {
          //   removePopup(hash)
          // }, 8000)
          transactionFinish()
          resolve({ ...pollOrderRes, lastTxHash })
          shiftTransaction()
        } else if (attempts < maxAttempts) {
          attempts++
          timer = setTimeout(poll, interval)
        } else {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Polling timed out')
        }
      }

      poll()
    })
  }
  return {
    pollOrderHash,
  }
}

const useProcess = () => {
  const isProcess = useSelector((state: AppState) => state.dappOSTransaction.process)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((value: any) => dispatch(updateProcessAction(value)), [dispatch])

  return {
    isProcess,
    update,
  }
}

const useIsPolling = () => {
  const isPolling = useSelector((state: AppState) => state.dappOSTransaction.isPolling)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((status: boolean) => dispatch(updateIsPollingAction(status)), [dispatch])

  return {
    isPolling,
    update,
  }
}

const usePendingCount = () => {
  const pendingCount = useSelector((state: AppState) => state.dappOSTransaction.pendingCount)

  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback((val: number) => dispatch(updatePendingCountAction(val)), [dispatch])

  return {
    pendingCount,
    update,
  }
}

const useTransactions = () => {
  const transactions = useSelector((state: AppState) => state.dappOSTransaction.transactions)

  const dispatch = useDispatch<AppDispatch>()
  const shift = useCallback(() => dispatch(shiftTransactionAction()), [dispatch])
  const push = useCallback((obj: any) => dispatch(pushTransactionAction(obj)), [dispatch])

  return {
    transactions,
    shift,
    push,
  }
}

const useHashSet = () => {
  const hashSet = useSelector((state: AppState) => state.dappOSTransaction.hashSet)
  const dispatch = useDispatch<AppDispatch>()
  const update = useCallback(
    (hash: string) => {
      // eslint-disable-next-line no-unused-expressions, no-sequences
      dispatch(updateHashSetAction(hash)), [dispatch]
    },
    [dispatch],
  )

  const del = useCallback(
    (hash: string) => {
      // eslint-disable-next-line no-unused-expressions, no-sequences
      dispatch(deleteHashSetAction(hash)), [dispatch]
    },
    [dispatch],
  )

  return {
    hashSet,
    update,
    del,
  }
}
