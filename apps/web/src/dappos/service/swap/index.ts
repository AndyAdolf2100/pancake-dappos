import { usePackedSdk } from 'dappos/sdk/usePackedSdk'
import { useLoading } from 'dappos/hooks/useLoading'
import { useMemo } from 'react'
import { getVirtualWallet } from 'dappos/utils/getVirtualWallet'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useDappOSInstitution } from 'state/dapposInstitution/hooks'
import { serviceAddressMap, appName, AddressZero } from 'dappos/constant/constant'
import { getExpTime } from 'dappos/utils'
import { ethers } from 'ethers'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { basisPointsToPercent } from 'utils/exchange'
import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import { Actions, genExactInData, encodeExactInputOrOutputForPath, genExactOutData } from './utils'

export const useSwapProtocol = () => {
  const { sendTransaction } = usePackedSdk()
  const { dstChainId, isIsolated, eoaAccount } = useAccountActiveChain()
  const { isSwapModeNormal } = useDappOSInstitution()
  const [allowedSlippage] = useUserSlippage() || [INITIAL_ALLOWED_SLIPPAGE]
  const { loading: swaploading, startLoading: startSwapLoading, endLoading: endSwapLoading } = useLoading()

  const swap = async (
    args: {
      trade: SmartRouterTrade<TradeType> | null | undefined
    },
    isSimulated = false,
  ): Promise<any> => {
    startSwapLoading()
    const { trade } = args
    console.log('args: ', args)
    if (!trade) return
    const routeIdsOrAddresses = trade?.routes?.[0].path.map((path) => (path as any)?.address ?? AddressZero)
    const path = encodeExactInputOrOutputForPath(
      routeIdsOrAddresses ?? [],
      trade.tradeType === TradeType.EXACT_OUTPUT,
      trade?.routes?.[0].pools.map((pool) => Number((pool as any).fee)) ?? [],
    )
    const inputCurrency = trade.inputAmount.currency
    const outputCurrency = trade.outputAmount.currency
    const pct = basisPointsToPercent(allowedSlippage)
    const inputAmount =
      trade.tradeType === TradeType.EXACT_INPUT
        ? trade.inputAmount.toFixed()
        : SmartRouter.maximumAmountIn(trade, pct).toFixed()
    const outputAmount =
      trade.tradeType === TradeType.EXACT_OUTPUT
        ? trade.outputAmount.toFixed()
        : SmartRouter.minimumAmountOut(trade, pct).toFixed()

    const cparam = {
      action: trade.tradeType === TradeType.EXACT_INPUT ? Actions.SwapExactInput : Actions.SwapExactOutput,
      remainGas: '0',
    }

    console.log('path', path)
    console.log('amountIn', inputAmount)
    console.log('amountOutMin', outputAmount)
    console.log('inputCurrency', inputCurrency)
    const executeData =
      trade.tradeType === TradeType.EXACT_INPUT
        ? genExactInData({
            path,
            amountIn: ethers.utils.parseUnits(inputAmount, inputCurrency.decimals).toString() ?? '0',
            amountOutMin: ethers.utils.parseUnits(outputAmount, outputCurrency.decimals).toString() ?? '0',
          })
        : genExactOutData({
            path,
            amountInMax: ethers.utils.parseUnits(inputAmount, inputCurrency.decimals).toString() ?? '0',
            amountOut: ethers.utils.parseUnits(outputAmount, outputCurrency.decimals).toString() ?? '0',
          })

    const virtualWallet = await getVirtualWallet(eoaAccount!, dstChainId)

    const params = {
      commonParam: cparam,
      app: appName,
      expTime: getExpTime(),
      service: serviceAddressMap[dstChainId as keyof typeof serviceAddressMap],
      text: 'Swap',
      isGateWay: 0,
      data: executeData,
      gasLimit: '800000',
      bridgeTokenOuts: [
        {
          amountOut: inputAmount,
          address: inputCurrency.isNative ? AddressZero : inputCurrency.address,
        },
      ],
      virtualWallet,
      useIsolate: isSwapModeNormal && isIsolated,
    }

    console.log('params = ', params)

    const result = await sendTransaction(params, isSimulated, 'Swap').catch((error) => {
      endSwapLoading()
      throw error
    })

    endSwapLoading()
    // eslint-disable-next-line consistent-return
    return result
  }

  const loading = useMemo(() => {
    return swaploading
  }, [swaploading])

  return {
    loading,
    swap,
  }
}
