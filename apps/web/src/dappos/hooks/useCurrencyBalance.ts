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

/**
 *  @description dappOS: replace old useCurrencyBalance from 'state/wallet/hooks'
 * */
export const useCurrencyBalance = (
  a?: string, // useless
  currency?: Currency | null,
): CurrencyAmount<Currency> | undefined => {
  const { isSdkReady } = useAccountActiveChain()
  const vwCurrencyBalance = useVwBalance(currency)
  const eoaCurrencyBalance = useEoaBalance(currency)

  // TODO need to return 0 when it doesn't connect wallet
  const finalValue = useMemo(
    () =>
      !isSdkReady || !currency
        ? undefined
        : (vwCurrencyBalance ?? CurrencyAmount.fromRawAmount(currency, 0)).add(
            eoaCurrencyBalance ?? CurrencyAmount.fromRawAmount(currency, 0),
          ),
    [currency, eoaCurrencyBalance, isSdkReady, vwCurrencyBalance],
  )
  return finalValue
}

/**
 * @description for wallet balance dialog vw balance
 * @returns
 */
export const useVwBalance = (currency?: Currency | null): CurrencyAmount<Currency> | undefined => {
  const { account, srcChainId } = useAccountActiveChain()
  const { vwBalanceOf } = useDappOSVwBalanceInfo()
  const { balance, isSupportedByDappOS, srcCurrency } = useCurrencyBalanceFromCache(account, currency)
  const finalValue = useMemo(() => {
    if (isSupportedByDappOS && srcCurrency && currency) {
      const vwBalance = vwBalanceOf(srcCurrency.tokenAddress, srcChainId)
      // console.log('vwBalance', vwBalance, isSupportedByDappOS, srcCurrency)
      return CurrencyAmount.fromRawAmount(
        currency,
        ethers.utils.parseUnits(vwBalance, srcCurrency.tokenDecimal).toString() ?? 0,
      )
    }
    return balance
  }, [balance, currency, isSupportedByDappOS, srcChainId, srcCurrency, vwBalanceOf])
  return finalValue
}

/**
 * @description for wallet balance dialog EOA balance (only EOA)
 * @returns
 */
export const useEoaBalance = (currency?: Currency | null): CurrencyAmount<Currency> | undefined => {
  const { eoaAccount } = useAccountActiveChain()
  const { balance } = useCurrencyBalanceFromCache(eoaAccount, currency)
  return balance
}

const useCurrencyBalanceFromCache = (
  account?: string, // eoa or vw address
  currency?: Currency | null,
): { balance: CurrencyAmount<Currency> | undefined; isSupportedByDappOS: boolean; srcCurrency: any } => {
  const { findCurrency, findTargetChainCurrency } = useDappOSWhiteList()
  const { getValueOfBalanceMap, updateCurrencyBalanceMap } = useDappOSCurrencyBalance()
  const { isSdkReady, isIsolated, dstChainId, srcChainId } = useAccountActiveChain()
  const [key, setKey] = useState('')
  const [isSupportedByDappOS, setIsSupportedByDappOS] = useState(false)
  const [targetCurrency, setTargetCurrency] = useState()

  const address = useMemo(() => (currency?.isToken ? currency.address : AddressZero).toLowerCase(), [currency])

  const loadTargetCurrencyInfoMap = useCallback(async () => {
    if (account && !isZeroAccount(account)) {
      const dstCurrency = await findCurrency(address, dstChainId)
      //  src chain currency is equal to dst chain currency when it's isolated.
      if (isIsolated) {
        const k = `${address.toLowerCase()}-${account.toLowerCase()}`
        setKey(k)
        if (!getValueOfBalanceMap(srcChainId, k)) {
          updateCurrencyBalanceMap(srcChainId, k, 0)
        }
        // we need return vw info from sdk for currency that dappOS is not support (single chain currency)
        if (dstCurrency) {
          setTargetCurrency(dstCurrency)
          setIsSupportedByDappOS(true)
        } else {
          setTargetCurrency(undefined)
          setIsSupportedByDappOS(false)
        }
        return
      }
      //   We need to find src chain currency by dst chain currency when it's not isolated.
      //   That would be a illegal currency (single chain currency in dst chain) if we can't find currency in the below code.
      if (dstCurrency) {
        const srcCurrency = await findTargetChainCurrency(srcChainId, dstCurrency)
        if (srcCurrency) {
          const k = `${srcCurrency.tokenAddress.toLowerCase()}-${account.toLowerCase()}`
          setKey(k)
          if (!getValueOfBalanceMap(srcChainId, k)) {
            updateCurrencyBalanceMap(srcChainId, k, 0)
            setIsSupportedByDappOS(true)
            setTargetCurrency(srcCurrency)
          }
          return
        }
      }
    }
    setKey('')
    setTargetCurrency(undefined)
    setIsSupportedByDappOS(false)
  }, [
    account,
    findCurrency,
    address,
    dstChainId,
    isIsolated,
    getValueOfBalanceMap,
    srcChainId,
    updateCurrencyBalanceMap,
    findTargetChainCurrency,
  ])

  useEffect(() => {
    loadTargetCurrencyInfoMap()
  }, [loadTargetCurrencyInfoMap])

  const balance = useMemo(() => {
    if (!account || !currency || !isSdkReady) {
      return undefined
    }
    const b = getValueOfBalanceMap(srcChainId, key) ?? 0
    return CurrencyAmount.fromRawAmount(currency, b)
  }, [account, currency, isSdkReady, getValueOfBalanceMap, srcChainId, key])

  // console.log('balance of eth', balance.toString(), key)
  return {
    isSupportedByDappOS,
    balance,
    srcCurrency: targetCurrency,
  }
}
