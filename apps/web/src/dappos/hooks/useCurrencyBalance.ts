import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { useCurrencyBalances, useEoaBalances, useVwBalances } from './useCurrencyBalances'

/**
 *  @description dappOS: replace old useCurrencyBalance from 'state/wallet/hooks'
 * */
export const useCurrencyBalance = (
  a?: string, // useless
  currency?: Currency | null,
): CurrencyAmount<Currency> | undefined => {
  const balances = useCurrencyBalances(a, [currency])
  return balances?.find((c) => currency === c?.currency)
}

/**
 * @description for wallet balance dialog vw balance
 * @returns
 */
export const useVwBalance = (currency?: Currency | null): CurrencyAmount<Currency> | undefined => {
  const vwCurrencyBalance = useVwBalances([currency])
  return vwCurrencyBalance?.find((c) => currency === c?.currency)
}

/**
 * @description for wallet balance dialog EOA balance (only EOA)
 * @returns
 */
export const useEoaBalance = (currency?: Currency | null): CurrencyAmount<Currency> | undefined => {
  const eoaCurrencyBalance = useEoaBalances([currency])
  return eoaCurrencyBalance?.find((c) => currency === c?.currency)
}
