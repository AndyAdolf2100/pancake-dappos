import { useDappOSTransaction } from 'state/dapposTransaction/hooks'
import { useSwapProtocol } from 'dappos/service/swap'
import { useDappOSVwBalanceInfo } from 'state/dapposVirtualWallet/hooks'
import { useMemo } from 'react'
// import { useAddPopup } from 'state/application/hooks'; // TODO notification

export const useServiceCaller = () => {
  // const addPopup = useAddPopup();
  const { pollOrderHash } = useDappOSTransaction()
  const { update: updateVwBalanceInfo } = useDappOSVwBalanceInfo()
  const { loading: swapLoading, exactInput, exactOutput } = useSwapProtocol()

  const startTransactionProcess = async (
    key: string,
    args: any,
    isSimulated: boolean,
    summary?: string,
  ): Promise<any> => {
    const hashOrResult = await serviceFn(key)(args, isSimulated)

    if (isSimulated) return hashOrResult // for simulating in dappos

    if (!hashOrResult && !isSimulated) return undefined // for rejected in dappos without hash

    // after sending transaction successfully below
    const hash = hashOrResult

    // TODO pending....
    // addPopup(
    //   {
    //     txn: {
    //       hash,
    //       pending: true,
    //       success: false,
    //       summary: summary,
    //     },
    //   },
    //   hash,
    //   null,
    // );

    const pollOrderRes = await pollOrderHash(hash)
    updateVwBalanceInfo()
    if (pollOrderRes?.data.orderHash === hash) {
      if (pollOrderRes?.isSuccess) {
        return {
          orderHash: hash,
          hash: pollOrderRes.lastTxHash,
        }
      }
    }
    // TODO failure notification
    return {
      orderHash: undefined,
      hash: undefined,
    }
  }

  const serviceFn = (key: string) => {
    console.log('serviceFn key: ', key)
    const fnMap = {
      exactInput,
      exactOutput,
    }
    return fnMap[key as keyof typeof fnMap]
  }

  const loading = useMemo(() => {
    return swapLoading
  }, [swapLoading])

  return {
    startTransactionProcess,
    loading,
  }
}
