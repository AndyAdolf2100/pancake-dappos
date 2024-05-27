import { ethers } from 'ethers'
import { VirtualWallet, RetryProvider, getRetryProvider } from '@dappos/v2-sdk'
import { getEvmChainParameter } from './networks'

type CustomProvider = ethers.providers.JsonRpcProvider

const providerCache = new Map<number, RetryProvider>()
export const getProvider = (chainId: number) => {
  const EvmChainParameter = getEvmChainParameter(chainId)
  if (!EvmChainParameter) {
    throw Error(` Not found this chainId: ${chainId}`)
  } else if (providerCache.has(Number(EvmChainParameter.chainId))) {
    return providerCache.get(Number(EvmChainParameter.chainId)) as unknown as CustomProvider
  } else {
    const { rpcUrls } = EvmChainParameter

    const network = { chainId: Number(chainId), name: 'unknown' }
    const rpcUrlSort = (rpcUrls ?? []).sort((a, b) => {
      try {
        if (window?.location?.host?.includes('dappos.')) return 0
      } catch (error) {
        console.error(error)
      }
      // return a.indexOf('ankr.com') - b.indexOf('ankr.com');
      return Number(/ankr\.com|infura/.test(a)) - Number(/ankr\.com|infura/.test(b))
    })

    console.debug('rpcUrlSort: ', rpcUrlSort)
    const _provider = getRetryProvider(rpcUrlSort, {
      network,
    })
    providerCache.set(Number(chainId), _provider)
    return _provider as unknown as CustomProvider
  }
}

class VirtualWalletCache {
  _cache: {
    [keyof: string]: VirtualWallet | undefined
  } = {}

  get cache() {
    return this._cache
  }

  getItem(key: string) {
    return this.cache[key]
  }

  setItem(key: string, value: any) {
    this.cache[key] = value
  }

  // {ownerAddress}-{dstChain}:{VirtualWallet}
  has(key: string) {
    return !!this.cache[key]
  }

  removeItem(key: string) {
    this.cache[key] = undefined
  }

  clear() {
    this._cache = {}
  }
}

export const vWalletCache = new VirtualWalletCache()

export const getVirtualWallet = async (owner: string, chainId: number, { cache } = { cache: true }) => {
  if (!owner) throw Error('owner is required')
  const lowerAddress = owner.toLowerCase()
  const key = `${lowerAddress}-${chainId}`
  if (cache) {
    if (vWalletCache.has(key)) {
      const cacheVirtual = vWalletCache.getItem(key)
      if (
        cacheVirtual &&
        cacheVirtual.walletCreated &&
        cacheVirtual.owner.toLowerCase() === lowerAddress &&
        cacheVirtual.chainId === chainId
      ) {
        return cacheVirtual
      }
    }
  }

  const virtualWallet = await VirtualWallet.init(lowerAddress, {
    env: process.env.REACT_APP_updateDappOS,
    provider: getProvider(chainId),
    chainId,
    version: '2',
  })
  if (virtualWallet.walletCreated) {
    vWalletCache.setItem(key, virtualWallet)
    return virtualWallet
  }
  return virtualWallet
}

export const initDstChainsVw = async (account: string) => {
  const virtualWalletManta = await getVirtualWallet(account, 169, {
    cache: false,
  })
  const virtualWalletPolygon = await getVirtualWallet(account, 137, {
    cache: false,
  })
  return {
    virtualWalletManta,
    virtualWalletPolygon,
  }
}
