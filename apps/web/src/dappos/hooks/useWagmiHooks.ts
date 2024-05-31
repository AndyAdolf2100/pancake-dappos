import { useAccount as useA, useBalance as useB } from 'wagmi'
import { useDappOSVirtualWallet } from 'state/dapposVirtualWallet/hooks'
import { Address } from 'viem'
import { useActiveChainId } from 'hooks/useActiveChainId'

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

export const useChainId = () => {
  const { chainId } = useActiveChainId()
  return chainId
}

export const useBalance = (params) => {
  const { srcChainId } = useActiveChainId()
  return useB({ ...params, chainId: srcChainId })
}
