import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { useCallback } from 'react'
import { Contract, Provider as MulticallProvider } from 'ethers-multicall'
import { getProvider } from 'dappos/utils/getVirtualWallet'
import erc20Abi from 'dappos/constant/abis/erc20.json'
import { AddressZero } from 'dappos/constant/constant'
import { updateBalanceMap, updateMultiBalanceMap } from './actions'

export const useDappOSCurrencyBalance = () => {
  const {
    getValueOfBalanceMap,
    getBalanceMapOfChain,
    updateMulti: updateMultiCurrencyBalanceMap,
    update: updateCurrencyBalanceMap,
  } = useCurrencyBalanceMap()

  const loadBalanceMapDataWithMulticall = async (chainId: number) => {
    const ethcallProvider = new MulticallProvider(getProvider(chainId), chainId)
    const keysArr = Object.keys(getBalanceMapOfChain(chainId)).map((key) => {
      const address = key.split('-')[0] // token address
      const account = key.split('-')[1] // account of vw or eoa
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

    // console.log(`[loadBalanceMapDataWithMulticall] chainId: ${chainId}, res:`, res)

    const keys = keysArr.map(({ account, address }) => {
      const key = `${address}-${account}`
      return key
    })
    updateMultiCurrencyBalanceMap(chainId, keys, res)
  }
  return {
    getValueOfBalanceMap,
    updateMultiCurrencyBalanceMap,
    updateCurrencyBalanceMap,
    loadBalanceMapDataWithMulticall,
  }
}

const useCurrencyBalanceMap = () => {
  const currencyBalanceMap = useSelector((state: AppState) => state.dappOSCurrencyBalance.currencyBalanceMap)
  const dispatch = useDispatch<AppDispatch>()

  const update = useCallback(
    (chainId: number, key: string, value: any) => {
      dispatch(updateBalanceMap({ chainId, key, value }))
    },
    [dispatch],
  )

  const updateMulti = useCallback(
    (chainId: number, keys: string[], values: any[]) => {
      dispatch(updateMultiBalanceMap({ chainId, keys, values }))
    },
    [dispatch],
  )

  const getBalanceMapOfChain = useCallback(
    (chainId: number) => {
      return currencyBalanceMap[chainId] ?? {}
    },
    [currencyBalanceMap],
  )

  const getValueOfBalanceMap = useCallback(
    (chainId: number, key: string) => {
      if (!currencyBalanceMap[chainId]) return undefined
      return getBalanceMapOfChain(chainId)[key]
    },
    [currencyBalanceMap, getBalanceMapOfChain],
  )

  return {
    currencyBalanceMap,
    getValueOfBalanceMap,
    getBalanceMapOfChain,
    update,
    updateMulti,
  }
}
