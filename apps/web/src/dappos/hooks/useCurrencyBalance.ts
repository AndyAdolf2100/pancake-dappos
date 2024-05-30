// import { useCurrencyBalance as useCB } from 'state/wallet/hooks'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useDappOSVwBalanceInfo } from 'state/dapposVirtualWallet/hooks'
import { useDappOSWhiteList } from 'state/dapposWhiteList/hooks'
import { useEffect, useState, useCallback } from 'react'
import { AddressZero } from 'dappos/constant/constant'
import { ethers } from 'ethers'
import { BigNumber } from 'bignumber.js'
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
  return !isSdkReady || !currency
    ? undefined
    : (vwCurrencyBalance ?? CurrencyAmount.fromRawAmount(currency, 0)).add(
        eoaCurrencyBalance ?? CurrencyAmount.fromRawAmount(currency, 0),
      )
}

/**
 * @description for wallet balance dialog vw balance
 * @returns
 */
export const useVwBalance = (currency?: Currency | null): CurrencyAmount<Currency> | undefined => {
  const { account } = useAccountActiveChain()
  return useCurrencyBalanceFromCache(account, currency)
}

/**
 * @description for wallet balance dialog EOA balance (only EOA)
 * @returns
 */
export const useEoaBalance = (currency?: Currency | null): CurrencyAmount<Currency> | undefined => {
  const { eoaAccount } = useAccountActiveChain()
  return useCurrencyBalanceFromCache(eoaAccount, currency)
}

const useCurrencyBalanceFromCache = (
  account?: string, // eoa or vw address
  currency?: Currency | null,
): CurrencyAmount<Currency> | undefined => {
  const { findCurrency, findTargetChainCurrency } = useDappOSWhiteList()
  const { isSdkReady, isIsolated, dstChainId, srcChainId } = useAccountActiveChain()
  const [key, setKey] = useState('')
  const { vwBalanceOf } = useDappOSVwBalanceInfo()
  const address = (currency?.isToken ? currency.address : AddressZero).toLowerCase()
  const { getValueOfBalanceMap, updateCurrencyBalanceMap } = useDappOSCurrencyBalance()

  const loadTargetCurrencyInfoMap = useCallback(async () => {
    if (!account || isZeroAccount(account)) return
    if (isIsolated) {
      const k = `${address.toLowerCase()}-${account.toLowerCase()}`
      if (!getValueOfBalanceMap(srcChainId, k)) {
        updateCurrencyBalanceMap(srcChainId, k, 0)
        setKey(k)
      }
      return
    }
    const dstCurrency = await findCurrency(address, dstChainId)
    if (!dstCurrency) return
    //   We need to find src chain currency by dst chain currency when it's not isolated.
    //   That would be a illegal currency (single chain currency in dst chain) if we can't find currency in the below code.
    const srcCurrency = await findTargetChainCurrency(srcChainId, dstCurrency)
    // console.log('find srcCurrency', srcCurrency, 'by dstCurrency', dstCurrency);
    if (srcCurrency) {
      const k = `${srcCurrency.tokenAddress.toLowerCase()}-${account.toLowerCase()}`
      if (!getValueOfBalanceMap(srcChainId, k)) {
        updateCurrencyBalanceMap(srcChainId, k, 0)
        setKey(k)
      }
    }
  }, [
    account,
    findCurrency,
    address,
    dstChainId,
    isIsolated,
    findTargetChainCurrency,
    srcChainId,
    getValueOfBalanceMap,
    updateCurrencyBalanceMap,
    setKey,
  ])

  useEffect(() => {
    loadTargetCurrencyInfoMap()
  }, [loadTargetCurrencyInfoMap])

  if (!account || !currency || !isSdkReady) return undefined
  // if (isVw) {
  //   const vwBalance = vwBalanceOf(address, srcChainId)
  //   if (BigNumber(vwBalance).gt(0)) {
  //     return CurrencyAmount.fromRawAmount(currency, ethers.utils.parseUnits(vwBalance, currency.decimals).toString() ?? 0)
  //   }
  // }
  const balance = getValueOfBalanceMap(srcChainId, key) ?? 0
  return CurrencyAmount.fromRawAmount(currency, balance)
}

// puts it into updater
// export async function loadMuticallData(chainId: number) {
//   const ethcallProvider = new MulticallProvider(getProvider(chainId), chainId)
//   const keysArr = Object.keys(currencyBalanceMap[chainId]).map((key) => {
//     const address = key.split('-')[0]
//     const account = key.split('-')[1]
//     return {
//       address,
//       account,
//     }
//   })
//   const requests = keysArr.map(({ account, address }) => {
//     if (address === AddressZero) {
//       return ethcallProvider.getEthBalance(account)
//     }
//     const erc20Contract = new Contract(address, erc20Abi)
//     return erc20Contract.balanceOf(account)
//   })
//   const res = await ethcallProvider.all(requests)

//   console.log('res ---- :', res)

//   keysArr.forEach(({ account, address }, index) => {
//     const key = `${address}-${account}`
//     currencyBalanceMap[chainId][key] = res[index]
//   })
// }

// setInterval(() => {
//   console.log('before currencyBalanceMap', currencyBalanceMap)
//   loadMuticallData(42161)
//   console.log('after currencyBalanceMap', currencyBalanceMap)
// }, 3000)

// eslint-disable-next-line react-hooks/rules-of-hooks
// useEffect(()=>{
//   loadMuticallData()
// }, [])
