// import { useCurrencyBalance as useCB } from 'state/wallet/hooks'

import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { Contract, Provider as MulticallProvider } from 'ethers-multicall'
import { getProvider } from 'dappos/utils/getVirtualWallet'
import { useDappOSVwBalanceInfo } from 'state/dapposVirtualWallet/hooks'
import { useDappOSWhiteList } from 'state/dapposWhiteList/hooks'
import { useEffect, useState } from 'react'
import { validSrcChainIds, AddressZero } from 'dappos/constant/constant'
import erc20Abi from 'dappos/constant/abis/erc20.json'

const currencyBalanceMap = {}
validSrcChainIds.forEach((id) => {
  currencyBalanceMap[id] = {}
})

export const useCurrencyBalance = (
  a?: string, // useless
  currency?: Currency | null,
): CurrencyAmount<Currency> | undefined => {
  const { account, eoaAccount, isSdkReady } = useAccountActiveChain()
  const { vwBalanceOf } = useDappOSVwBalanceInfo()
  const useVwBalance = () => {
    return useCurrencyBalanceFromCache(account, currency)
  }
  const useEoaBalance = () => {
    return useCurrencyBalanceFromCache(eoaAccount, currency)
  }
  const vwCurrencyBalance = useVwBalance()
  const eoaCurrencyBalance = useEoaBalance()

  // TODO need to return 0 when it doesn't connect wallet
  return !isSdkReady || !currency
    ? undefined
    : (vwCurrencyBalance ?? CurrencyAmount.fromRawAmount(currency, 0)).add(
        eoaCurrencyBalance ?? CurrencyAmount.fromRawAmount(currency, 0),
      )
}

const useCurrencyBalanceFromCache = (
  a: string, // useless
  currency?: Currency | null,
) => {
  const { findCurrency, findTargetChainCurrency } = useDappOSWhiteList()
  const { isSdkReady, isIsolated, dstChainId, srcChainId } = useAccountActiveChain()
  const [key, setKey] = useState('')

  useEffect(() => {
    async function loadTargetCurrency() {
      const address = (currency?.isToken ? currency.address : AddressZero).toLowerCase()
      if (a === AddressZero) return // ignore AddressZero vw or eoa address
      if (isIsolated) {
        // when isolated, we can use currency address directly
        const k = `${address}-${a.toLowerCase()}`
        if (!currencyBalanceMap[srcChainId][k]) {
          currencyBalanceMap[srcChainId][k] = 0
          setKey(k)
        }
        return
      }
      /*
        We need to find src chain currency by dst chain currency when it's not isolated.
        That would be a illegal currency (single chain currency in dst chain) if we can't find currency in the below code.
       */
      const dstCurrency = await findCurrency(address, dstChainId)
      if (!dstCurrency) return
      const targetCurrency = await findTargetChainCurrency(srcChainId, dstCurrency)
      if (!targetCurrency) return
      const k = `${targetCurrency.address.toLowerCase()}-${a.toLowerCase()}`
      if (!currencyBalanceMap[srcChainId][k]) {
        currencyBalanceMap[srcChainId][k] = 0
        setKey(k)
      }
    }
    loadTargetCurrency()
  })

  if (!currency || !isSdkReady) return undefined
  return CurrencyAmount.fromRawAmount(currency, currencyBalanceMap[srcChainId][key] ?? 0)
}

// puts it into updater
export async function loadMuticallData(chainId: number) {
  const ethcallProvider = new MulticallProvider(getProvider(chainId), chainId)
  const keysArr = Object.keys(currencyBalanceMap[chainId]).map((key) => {
    const address = key.split('-')[0]
    const account = key.split('-')[1]
    return {
      address,
      account,
    }
  })
  const requests = keysArr.map(({ account, address }) => {
    if (address === AddressZero) {
      return ethcallProvider.getEthBalance(account)
    }
    const erc20Contract = new Contract(address, erc20Abi)
    return erc20Contract.balanceOf(account)
  })
  const res = await ethcallProvider.all(requests)

  console.log('res ---- :', res)

  keysArr.forEach(({ account, address }, index) => {
    const key = `${address}-${account}`
    currencyBalanceMap[chainId][key] = res[index]
  })
}

setInterval(() => {
  console.log('before currencyBalanceMap', currencyBalanceMap)
  loadMuticallData(42161)
  console.log('after currencyBalanceMap', currencyBalanceMap)
}, 3000)

// eslint-disable-next-line react-hooks/rules-of-hooks
// useEffect(()=>{
//   loadMuticallData()
// }, [])
