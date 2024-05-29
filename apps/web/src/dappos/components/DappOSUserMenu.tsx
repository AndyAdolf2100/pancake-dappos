import { useAccount } from 'dappos/hooks/useWagmiHooks'
import { useMemo } from 'react'

enum IConnector {
  WALLET_CONNECT = 'WalletConnect',
  METAMASK = 'MetaMask',
  BITGET = 'Bitget',
  GOOGLE = 'google',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
}
const DappOSUserMenu = () => {
  const { connector, chainId } = useAccount()
  const connectorName = connector?.name
  const logo = useMemo(() => {
    if (connectorName === IConnector.METAMASK) {
      return 'https://dappos-public-resource.s3.amazonaws.com/dappLogo/metamask.png'
    }
    if (
      connectorName === IConnector.GOOGLE ||
      connectorName === IConnector.FACEBOOK ||
      connectorName === IConnector.TWITTER
    ) {
      return 'https://dappos-public-resource.s3.amazonaws.com/dappLogo/cubi.png'
    }
    if (connectorName === IConnector.WALLET_CONNECT) {
      return 'https://dappos-public-resource.s3.amazonaws.com/dappLogo/walletconnect.png'
    }
    return 'https://dappos-public-resource.s3.amazonaws.com/dappLogo/metamask.png'
  }, [connectorName])

  // TODO: can't get connectorInfo of connector
  const connectorInfo = useMemo(() => {
    return {
      showRed: false,
      chainId,
      logo,
      name: connectorName,
    }
  }, [chainId, connectorName, logo])

  return <dappos-wallet-lite connector={connectorInfo} size="sm" position="bottom-end" />
}

export default DappOSUserMenu
