import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useDappOSProtocolIsReady, useDstChainId } from 'state/dappos/hooks' // dappOS
import { useDappOSVirtualWallet, useDappOSVwIsReady } from 'state/dapposVirtualWallet/hooks'
import { getProvider } from 'dappos/utils/getVirtualWallet'
import { useActiveChainId } from './useActiveChainId'

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */
const useAccountActiveChain = () => {
  const { address: account, status, connector } = useAccount()
  const { currentVwAddress } = useDappOSVirtualWallet() // dappOS
  const { chainId } = useActiveChainId() // srcChainId
  const { dstChainId }: { dstChainId: number } = useDstChainId() // dappOS
  const { isVwReady } = useDappOSVwIsReady() // dappOS
  const { isProtocolReady } = useDappOSProtocolIsReady() // dappOS

  return useMemo(
    () => ({
      account: currentVwAddress,
      eoaAccount: account,
      chainId: dstChainId,
      srcChainId: chainId,
      dstChainId,
      status,
      connector,
      library: getProvider(dstChainId), // dappOS from dst chain
      isSdkReady: isVwReady && isProtocolReady,
    }),
    [account, chainId, connector, status, dstChainId, isVwReady, isProtocolReady, currentVwAddress],
  )
}

export default useAccountActiveChain
