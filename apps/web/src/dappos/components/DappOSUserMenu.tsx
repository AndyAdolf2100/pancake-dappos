// @ts-ignore
// @ts-nocheck
import { useAccount } from 'dappos/hooks/useWagmiHooks'
import { useMemo } from 'react'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { Box } from '@pancakeswap/uikit'
import Trans from 'components/Trans'
import useAuth from 'hooks/useAuth'

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
  const { eoaAccount: account } = useAccount()
  const { logout } = useAuth()
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

  if (account) {
    return (
      <>
        <dappos-wallet-lite
          ref={(e) => {
            e?.addEventListener('disconnect', () => {
              logout()
            })
          }}
          connector={connectorInfo}
          size="sm"
          position="bottom-end"
        />
      </>
    )
  }

  return (
    <ConnectWalletButton scale="sm">
      <Box display={['none', null, null, 'block']}>
        <Trans>Connect Wallet</Trans>
      </Box>
      <Box display={['block', null, null, 'none']}>
        <Trans>Connect</Trans>
      </Box>
    </ConnectWalletButton>
  )
}

export default DappOSUserMenu
