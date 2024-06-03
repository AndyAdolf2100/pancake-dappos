// import { useCurrencyBalance as useCB } from 'state/wallet/hooks'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useDappOSVwBalanceInfo } from 'state/dapposVirtualWallet/hooks'
import { useDappOSWhiteList } from 'state/dapposWhiteList/hooks'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { AddressZero } from 'dappos/constant/constant'
import { ethers } from 'ethers'
import { useDappOSCurrencyBalance } from 'state/dappOSCurrencyBalance/hooks'
import { isZeroAccount } from 'dappos/utils'
import BigNumber from 'bignumber.js'

/**
 *  @description dappOS: replace old useCurrencyBalance from 'state/wallet/hooks'
 * */
export const useCurrencyBalances = (
  a?: string, // useless
  currencies?: (Currency | undefined | null)[],
): (CurrencyAmount<Currency> | undefined)[] => {
  const { isSdkReady } = useAccountActiveChain()
  const vwCurrencyBalance = useVwBalances(currencies)
  const eoaCurrencyBalance = useEoaBalances(currencies)

  // TODO need to return 0 when it doesn't connect wallet
  const finalValue = useMemo(() => {
    return (
      currencies?.map((currency) => {
        return !isSdkReady || !currency
          ? undefined
          : (vwCurrencyBalance?.find((c) => currency === c?.currency) ?? CurrencyAmount.fromRawAmount(currency, 0)).add(
              eoaCurrencyBalance?.find((c) => currency === c?.currency) ?? CurrencyAmount.fromRawAmount(currency, 0),
            )
      }) ?? []
    )
  }, [currencies, eoaCurrencyBalance, isSdkReady, vwCurrencyBalance])

  return finalValue
}

/**
 * @description for wallet balance dialog vw balance
 * @returns
 */
export const useVwBalances = (
  currencies?: (Currency | undefined | null)[],
): (CurrencyAmount<Currency> | undefined)[] => {
  const { account, srcChainId } = useAccountActiveChain()
  const { vwBalanceOf } = useDappOSVwBalanceInfo()
  const { balances } = useCurrencyBalancesFromCache(account, currencies)
  const finalValue = useMemo(() => {
    return (
      currencies?.map((currency) => {
        const cacheBalance = balances?.find((b) => b.balance?.currency === currency)
        const isSupportedByDappOS = cacheBalance?.isSupportedByDappOS
        const srcCurrency = cacheBalance?.srcCurrency
        if (isSupportedByDappOS && srcCurrency && currency) {
          const vwBalance = vwBalanceOf(srcCurrency.tokenAddress, srcChainId)
          // console.log('vwBalance', vwBalance, isSupportedByDappOS, srcCurrency)
          const srcBalance = ethers.utils.parseUnits(vwBalance, srcCurrency.tokenDecimal)
          const dstBalance = ethers.utils.parseUnits(
            new BigNumber(ethers.utils.formatUnits(srcBalance, srcCurrency.tokenDecimal)).toFixed(currency.decimals, 1),
            currency.decimals,
          ) // just for visible
          return CurrencyAmount.fromRawAmount(currency, dstBalance.toString() ?? 0)
        }
        return cacheBalance?.balance
      }) ?? []
    )
  }, [balances, currencies, srcChainId, vwBalanceOf])
  return finalValue
}

/**
 * @description for wallet balance dialog EOA balance (only EOA)
 * @returns
 */
export const useEoaBalances = (
  currencies?: (Currency | undefined | null)[],
): (CurrencyAmount<Currency> | undefined)[] => {
  const { eoaAccount } = useAccountActiveChain()
  const { balances } = useCurrencyBalancesFromCache(eoaAccount, currencies)
  const finalValue = useMemo(
    () =>
      currencies?.map((currency) => {
        const cacheBalance = balances?.find((b) => b.balance?.currency === currency)
        return cacheBalance?.balance
      }) ?? [],
    [balances, currencies],
  )
  return finalValue
}

const useCurrencyBalancesFromCache = (
  account?: string, // eoa or vw address
  currencies?: (Currency | undefined | null)[],
): {
  balances: {
    balance: CurrencyAmount<Currency> | undefined
    isSupportedByDappOS: boolean
    srcCurrency: any
  }[]
} => {
  const { findCurrency, findTargetChainCurrency } = useDappOSWhiteList()
  const { getValueOfBalanceMap, updateMultiCurrencyBalanceMap } = useDappOSCurrencyBalance()
  const { isSdkReady, isIsolated, dstChainId, srcChainId } = useAccountActiveChain()
  const [key, setKey] = useState({})
  const [isSupportedByDappOS, setIsSupportedByDappOS] = useState({})
  const [targetCurrency, setTargetCurrency] = useState({})

  const addresses = useMemo(() => {
    return (
      currencies?.map((currency) => {
        return currency?.isToken ? currency.address.toLowerCase() : AddressZero
      }) ?? []
    )
  }, [currencies])

  const loadTargetCurrenciesInfoMap = useCallback(async () => {
    const keyHash = {}
    const targetCurrencyHash = {}
    const isSupportedByDappOSHash = {}
    const unhandledKeys: string[] = []
    await Promise.all(
      addresses.map(async (address) => {
        if (account && !isZeroAccount(account)) {
          const dstCurrency = await findCurrency(address, dstChainId)
          //  src chain currency is equal to dst chain currency when it's isolated.
          if (isIsolated) {
            const k = `${address.toLowerCase()}-${account.toLowerCase()}`
            keyHash[address] = k
            if (!getValueOfBalanceMap(srcChainId, k)) {
              unhandledKeys.push(k)
            }
            // we need return vw info from sdk for currency that dappOS is not support (single chain currency)
            if (dstCurrency) {
              targetCurrencyHash[address] = dstCurrency
              isSupportedByDappOSHash[address] = true
            } else {
              targetCurrencyHash[address] = undefined
              isSupportedByDappOSHash[address] = false
            }
            return
          }
          //   We need to find src chain currency by dst chain currency when it's not isolated.
          //   That would be a illegal currency (single chain currency in dst chain) if we can't find currency in the below code.
          if (dstCurrency) {
            const srcCurrency = await findTargetChainCurrency(srcChainId, dstCurrency)
            if (srcCurrency) {
              const k = `${srcCurrency.tokenAddress.toLowerCase()}-${account.toLowerCase()}`
              keyHash[address] = k
              if (!getValueOfBalanceMap(srcChainId, k)) {
                unhandledKeys.push(k)
              }
              targetCurrencyHash[address] = srcCurrency
              isSupportedByDappOSHash[address] = true
              return
            }
          }
        }
        keyHash[address] = ''
        targetCurrencyHash[address] = undefined
        isSupportedByDappOSHash[address] = false
      }),
    )
    if (JSON.stringify(keyHash) !== JSON.stringify(key)) setKey(() => ({ ...keyHash }))
    if (JSON.stringify(targetCurrencyHash) !== JSON.stringify(targetCurrency))
      setTargetCurrency(() => ({ ...targetCurrencyHash }))
    if (JSON.stringify(isSupportedByDappOSHash) !== JSON.stringify(isSupportedByDappOS))
      setIsSupportedByDappOS(() => ({ ...isSupportedByDappOSHash }))
    if (unhandledKeys.length > 0) {
      updateMultiCurrencyBalanceMap(
        srcChainId,
        unhandledKeys,
        unhandledKeys.map(() => 0),
      )
    }
  }, [
    addresses,
    key,
    targetCurrency,
    isSupportedByDappOS,
    account,
    findCurrency,
    dstChainId,
    isIsolated,
    getValueOfBalanceMap,
    srcChainId,
    findTargetChainCurrency,
    updateMultiCurrencyBalanceMap,
  ])

  useEffect(() => {
    loadTargetCurrenciesInfoMap()
  }, [loadTargetCurrenciesInfoMap])

  const balances = useMemo(() => {
    return (
      currencies?.map((currency) => {
        const address = currency?.isToken ? currency.address.toLowerCase() : AddressZero
        const getBalance = () => {
          if (!account || !currency || !isSdkReady) {
            return undefined
          }
          const srcBalance = getValueOfBalanceMap(srcChainId, key[address]) ?? 0
          const dstBalance = isIsolated
            ? srcBalance
            : targetCurrency && targetCurrency[address]
            ? ethers.utils.parseUnits(
                new BigNumber(
                  ethers.utils.formatUnits(srcBalance, (targetCurrency[address] as any).tokenDecimal),
                ).toFixed(currency.decimals, 1),
                currency.decimals,
              ) // just for visible
            : 0
          return CurrencyAmount.fromRawAmount(currency, dstBalance)
        }
        const balance = getBalance()
        return {
          balance,
          isSupportedByDappOS: isSupportedByDappOS[address],
          srcCurrency: targetCurrency[address],
        }
      }) ?? []
    )
  }, [
    account,
    currencies,
    getValueOfBalanceMap,
    isIsolated,
    isSdkReady,
    isSupportedByDappOS,
    key,
    srcChainId,
    targetCurrency,
  ])

  return {
    balances,
  }
}
