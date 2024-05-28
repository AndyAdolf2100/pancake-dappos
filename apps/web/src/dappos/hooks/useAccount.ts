import { useAccount as useA } from 'wagmi'
import { useDappOSVirtualWallet } from 'state/dapposVirtualWallet/hooks'
import { Address } from 'viem'

export const useAccount = () => {
  const { currentVwAddress } = useDappOSVirtualWallet() // dappOS
  const accountInfo = useA()
  return {
    ...accountInfo,
    account: currentVwAddress as Address,
    address: currentVwAddress as Address,
    vwAddress: currentVwAddress as Address,
    eoaAccount: accountInfo.address as Address,
  }
}
