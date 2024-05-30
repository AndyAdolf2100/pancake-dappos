import { useMemo } from 'react'
import { useDappOSProtocolIsReady } from 'state/dappos/hooks' // dappOS
import { getProvider } from 'dappos/utils/getVirtualWallet'
import { useAccount } from 'dappos/hooks/useWagmiHooks' // dappOS
import { useDappOSVwIsReady } from 'state/dapposVirtualWallet/hooks'
import { useActiveChainId } from './useActiveChainId'

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */
const useAccountActiveChain = () => {
  const { account, eoaAccount, status, connector } = useAccount()
  const { chainId, srcChainId, dstChainId } = useActiveChainId() // srcChainId
  const { isVwReady } = useDappOSVwIsReady() // dappOS
  const { isProtocolReady } = useDappOSProtocolIsReady() // dappOS

  return useMemo(
    () => ({
      account, // vw
      eoaAccount, // eoa
      chainId, // dst chain id
      srcChainId,
      dstChainId,
      status,
      connector,
      library: getProvider(dstChainId), // dappOS from dst chain
      isIsolated: srcChainId === dstChainId, // dappOS
      isSdkReady: isVwReady && isProtocolReady,
    }),
    [account, connector, status, dstChainId, isVwReady, isProtocolReady, srcChainId, eoaAccount, chainId],
  )
}

export default useAccountActiveChain
