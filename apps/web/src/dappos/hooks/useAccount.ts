import { useAccount as useA } from 'wagmi'
import { useDappOSVirtualWallet } from 'state/dapposVirtualWallet/hooks'

export const useAccount = () => {
  const { currentVwAddress } = useDappOSVirtualWallet() // dappOS
  const accountInfo = useA()
  return {
    ...accountInfo,
    account: currentVwAddress,
    address: currentVwAddress,
    eoaAccount: accountInfo.address,
  }
}
