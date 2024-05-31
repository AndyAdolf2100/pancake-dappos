import useAccountActiveChain from 'hooks/useAccountActiveChain'
import DappOSProtocol from '@dappos/checkout'
import { useCallback, useEffect, useState } from 'react'
import { appName } from 'dappos/constant/constant'
import { useDappOSVwBalanceInfo, useDappOSVirtualWallet, useDappOSVwIsReady } from 'state/dapposVirtualWallet/hooks'
import { useDappOSWhiteList } from 'state/dapposWhiteList/hooks'
import { initDstChainsVw } from 'dappos/utils/getVirtualWallet'
import { loadingInitialized } from 'dappos/utils/loading'
import { providers } from 'ethers'
import DappOSWalletLite from '@dappos/wallet-lite'
import { useDappOSCurrencyBalance } from 'state/dappOSCurrencyBalance/hooks'
import { useDappOSWalletLite, useDappOSProtocol, usePaydbAddress, useDappOSProtocolIsReady } from './hooks'

const { loading, startLoading, endLoading } = loadingInitialized()

const { Web3Provider } = providers

export default function DappOSUpdater(): null {
  const { connector, srcChainId: chainId, eoaAccount: account } = useAccountActiveChain()

  const [isInitialConnection, setInitialConnection] = useState(true)

  const { dappOSProtocol, update: updateDappOSProtocol } = useDappOSProtocol()

  const { update: updatePaydbAddress } = usePaydbAddress()

  const { update: updateVwIsReady } = useDappOSVwIsReady()

  const { dappOSWalletLite, update: updateDappOSWalletLite } = useDappOSWalletLite()

  const { loadWhiteList } = useDappOSWhiteList()

  const { isProtocolReady, update: updateDappOSProtocolIsReady } = useDappOSProtocolIsReady()

  const { update: updateDappOSVwBalanceInfo } = useDappOSVwBalanceInfo()

  const { updateArbitrum, updateBinanceSmart, updateEthereum, updateBase } = useDappOSVirtualWallet()

  const { loadBalanceMapDataWithMulticall } = useDappOSCurrencyBalance()

  const [count, setCount] = useState(0)

  const initProtocol = useCallback(async () => {
    if (loading || !dappOSProtocol) return
    console.log('start init Protocol')
    startLoading()
    const dappOSProtocolOption = {
      metadata: {
        name: appName,
        url: window.location.origin,
        icon: 'https://dappos-public-resource.s3.amazonaws.com/dappLogo/pancakeswap.png',
      },
      env: process.env.NEXT_PUBLIC_DAPPOS_ENV ?? 'production',
      rpcMaps: {},
    }

    await dappOSProtocol.init(dappOSProtocolOption).finally(() => {
      endLoading()
      setInitialConnection(false)
      console.log('end init Protocol')
    })
  }, [dappOSProtocol])

  const initVirtualWalletInfo = useCallback(async () => {
    const [res, _] = await Promise.all([initDstChainsVw(account!), updateDappOSVwBalanceInfo()])
    const { vwArb, vwBase, vwBsc, vwEth } = res
    updateEthereum(vwEth.address)
    updateArbitrum(vwArb.address)
    updateBase(vwBase.address)
    updateBinanceSmart(vwBsc.address)
    updateVwIsReady(true)
  }, [
    account,
    updateDappOSVwBalanceInfo,
    updateEthereum,
    updateArbitrum,
    updateBase,
    updateBinanceSmart,
    updateVwIsReady,
  ])

  const connectProtocol = useCallback(async () => {
    console.log('%cdappOSProtocol connect: ', 'color:#2aae68; font-size: 16px; font-weight: bold;')
    if (!account || !dappOSProtocol || !connector || !connector.getProvider) return
    updateDappOSProtocolIsReady(false)
    const library = await connector.getProvider()
    const connectorInfo = (() => {
      const metamask = {
        name: 'MetaMask',
        logo: 'https://dappos-public-resource.s3.amazonaws.com/dappLogo/metamask.png',
      }
      return metamask
    })()

    console.log('connector', connector)

    const { version } = await dappOSWalletLite.connect(account, [42161], [42161])

    await dappOSProtocol.connect({
      version,
      connector: connectorInfo,
      chainId,
      owner: account,
      provider: new Web3Provider(library as any),
      ownerSigner: new Web3Provider(library as any).getSigner(),
    })

    const paydbAddress = await dappOSProtocol.getPayDbAddress(chainId)
    updatePaydbAddress(paydbAddress)
    updateDappOSProtocolIsReady(true)
    console.log('%cdappOSProtocol connect success', 'color:#2aae68; font-size: 16px; font-weight: bold;')
  }, [account, dappOSProtocol, connector, updateDappOSProtocolIsReady, dappOSWalletLite, chainId, updatePaydbAddress])

  // vw info loader
  useEffect(() => {
    if (isProtocolReady) {
      initVirtualWalletInfo()
    }
  }, [isProtocolReady, initVirtualWalletInfo])

  // DappOS Protocol loader
  useEffect(() => {
    if (!isInitialConnection) {
      connectProtocol()
    } else if (dappOSProtocol) {
      initProtocol()
    } else {
      updateDappOSProtocol(new DappOSProtocol())
      updateDappOSWalletLite(new DappOSWalletLite())
    }
  }, [isInitialConnection, initProtocol, connectProtocol, dappOSProtocol, updateDappOSProtocol, updateDappOSWalletLite])

  // Currency balance multicall updater
  let timeout
  useEffect(() => {
    async function loadMuticallData() {
      if (timeout) clearTimeout(timeout)
      await loadBalanceMapDataWithMulticall(chainId)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeout = setTimeout(() => {
        setCount(count + 1)
      }, 3000)
    }
    loadMuticallData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, chainId])

  // White list loader
  useEffect(() => {
    try {
      loadWhiteList()
    } catch (error) {
      console.log('reconnect...')
      loadWhiteList() // reload
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
