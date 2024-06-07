import { usePackedSdk } from 'dappos/sdk/usePackedSdk'
import { useLoading } from 'dappos/hooks/useLoading'
import { useMemo } from 'react'
import { getVirtualWallet } from 'dappos/utils/getVirtualWallet'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useDappOSInstitution } from 'state/dapposInstitution/hooks'
import { serviceAddressMap, appName, AddressZero } from 'dappos/constant/constant'
import { getExpTime } from 'dappos/utils'
import { ethers } from 'ethers'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { basisPointsToPercent } from 'utils/exchange'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import { Field } from 'state/mint/actions'
import { Actions, genCollectData, genDecreasePositionData, genIncreasePositionData, genMintPositionData } from './utils'

// V3 Liquidity
export const useLiquidityProtocol = () => {
  const { sendTransaction } = usePackedSdk()
  const { dstChainId, isIsolated, eoaAccount } = useAccountActiveChain()
  const { isSwapModeNormal } = useDappOSInstitution()
  const { loading: mintLoading, startLoading: startMintLoading, endLoading: endMintLoading } = useLoading()
  const { loading: increaseLoading, startLoading: startIncreaseLoading, endLoading: endIncreaseLoading } = useLoading()
  const { loading: decreaseLoading, startLoading: startDecreaseLoading, endLoading: endDecreaseLoading } = useLoading()
  const { loading: collectLoading, startLoading: startCollectLoading, endLoading: endCollectLoading } = useLoading()
  const [allowedSlippage] = useUserSlippage() || [INITIAL_ALLOWED_SLIPPAGE]

  const mint = async (
    args: {
      parsedAmounts: {
        CURRENCY_A?: CurrencyAmount<Currency> | undefined
        CURRENCY_B?: CurrencyAmount<Currency> | undefined
      }
      ticks: {
        LOWER?: number | undefined
        UPPER?: number | undefined
      }
      fee: number
    },
    isSimulated = false,
  ) => {
    startMintLoading()
    const { parsedAmounts, ticks, fee } = args
    const currencyAmountA = parsedAmounts[Field.CURRENCY_A]
    const currencyAmountB = parsedAmounts[Field.CURRENCY_B]
    const tickLower = ticks?.LOWER?.toString()
    const tickUpper = ticks?.UPPER?.toString()
    if (!currencyAmountA || !currencyAmountB || !tickLower || !tickUpper || !fee) {
      throw new Error('Wrong parameters in mint')
    }
    const pct = basisPointsToPercent(allowedSlippage)
    const currencyA = currencyAmountA.currency.isNative
      ? currencyAmountA.wrapped.currency.address
      : currencyAmountA.currency.address
    const currencyB = currencyAmountB.currency.isNative
      ? currencyAmountB.wrapped.currency.address
      : currencyAmountB.currency.address
    const currencyADesired = currencyAmountA.quotient.toString()
    const currencyBDesired = currencyAmountB.quotient.toString()
    const currencyAMin = currencyAmountA.subtract(currencyAmountA.multiply(pct)).quotient.toString()
    const currencyBMin = currencyAmountB.subtract(currencyAmountB.multiply(pct)).quotient.toString()

    if (!isSimulated) {
      const sortAddresses: string[] = [currencyA, currencyB].sort((i, j) => Number(i) - Number(j))
      if (sortAddresses[1] === currencyA && sortAddresses[0] === currencyB) {
        // need reverse
        console.log('tokens need reverse')
        return mint(
          {
            parsedAmounts: {
              CURRENCY_A: currencyAmountB,
              CURRENCY_B: currencyAmountA,
            },
            ticks,
            fee,
          },
          isSimulated,
        )
      }
    }

    console.log(
      currencyA,
      currencyB,
      currencyADesired,
      currencyBDesired,
      currencyAMin,
      currencyBMin,
      tickUpper,
      tickLower,
      fee,
    )

    const executeData = genMintPositionData({
      token0: currencyA,
      token1: currencyB,
      amount0Desired: currencyADesired,
      amount1Desired: currencyBDesired,
      amount0Min: currencyAMin,
      amount1Min: currencyBMin,
      fee: fee.toString(),
      tickLower,
      tickUpper,
    })

    const virtualWallet = await getVirtualWallet(eoaAccount!, dstChainId)

    const cparam = {
      action: Actions.MintNewPosition,
      remainGas: '0',
    }

    const params = {
      commonParam: cparam,
      app: appName,
      expTime: getExpTime(),
      service: serviceAddressMap[dstChainId as keyof typeof serviceAddressMap],
      text: 'Add Liquidity',
      isGateWay: 0,
      data: executeData,
      gasLimit: '800000',
      bridgeTokenOuts: [
        {
          amountOut: currencyAmountA.toFixed(),
          address: currencyAmountA.currency.isNative ? AddressZero : currencyAmountA.currency.address,
        },
        {
          amountOut: currencyAmountB.toFixed(),
          address: currencyAmountB.currency.isNative ? AddressZero : currencyAmountB.currency.address,
        },
      ],
      virtualWallet,
      useIsolate: isSwapModeNormal && isIsolated,
    }

    console.log('params = ', params)

    const result = await sendTransaction(params, isSimulated, 'Add Liquidity').catch((error) => {
      endMintLoading()
      throw error
    })
    endMintLoading()

    return result
  }

  const increase = () => {
    startIncreaseLoading()
    endIncreaseLoading()
  }

  const decrease = () => {
    startDecreaseLoading()
    endDecreaseLoading()
  }

  const collect = () => {
    startCollectLoading()
    endCollectLoading()
  }

  const loading = useMemo(() => {
    return mintLoading || increaseLoading || decreaseLoading || collectLoading
  }, [mintLoading, decreaseLoading, collectLoading, increaseLoading])

  return {
    loading,
    mint,
    increase,
    decrease,
    collect,
  }
}
