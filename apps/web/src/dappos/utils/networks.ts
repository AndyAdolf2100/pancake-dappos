// available src chains
export enum ChainIds {
  ETHEREUM = 1,
  BSC = 56,
  OP = 10,
  AVAX = 43114,
  POLYGON = 137,
  MANTA = 169,
  ARBITRUM = 42161,
}
export interface EvmChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
  iconUrls?: string[] // Currently ignored.
}

export const networks: Record<ChainIds, EvmChainParameter> = {
  [ChainIds.BSC]: {
    chainId: '0x38',
    chainName: 'BNB Chain',
    blockExplorerUrls: ['https://bscscan.com'],
    rpcUrls: [
      'https://rpc.ankr.com/bsc/12c187efd7ef6e437a404f3b56cd2ef24daeb506b3afc9c9691d75afc98b7183',
      'https://bsc.blockpi.network/v1/rpc/531659942ce05cfdfeea3a0f8ae4be0d4e0028cc',
      'https://endpoints.omniatech.io/v1/bsc/mainnet/public',
      'https://rpc.ankr.com/bsc',
      'https://bsc.rpc.blxrbdn.com',
      'https://bsc.blockpi.network/v1/rpc/public',
      'https://1rpc.io/bnb',
      'https://bsc-mainnet.gateway.pokt.network/v1/lb/b1853cb0',
      'https://bsc.publicnode.com',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed4.bnbchain.org',
      'https://bsc.drpc.org',
    ],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    iconUrls: ['https://dappos-public-resource.s3.amazonaws.com/chainLogo/chain_56_icon.png'],
  },
  [ChainIds.POLYGON]: {
    chainId: '0x89', // 137
    chainName: 'Polygon',
    blockExplorerUrls: ['https://polygonscan.com'],
    rpcUrls: [
      'https://polygon-mainnet.infura.io/v3/bd4216db4b0e471088d366a9eb68fa02',
      'https://rpc.ankr.com/polygon/12c187efd7ef6e437a404f3b56cd2ef24daeb506b3afc9c9691d75afc98b7183',
      'https://polygon-mainnet.public.blastapi.io',
      'https://poly-mainnet.gateway.pokt.network/v1/lb/b1853cb0',
      'https://poly-rpc.gateway.pokt.network',
      'https://polygon.blockpi.network/v1/rpc/public',
      'https://polygon.llamarpc.com',
      'https://polygon.meowrpc.com',
      'https://polygon.drpc.org',
      'https://polygon-rpc.com',
    ],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    iconUrls: ['https://dappos-public-resource.s3.amazonaws.com/chainLogo/chain_137_icon.png'],
  },
  [ChainIds.AVAX]: {
    chainId: '0xa86a', // 43114
    chainName: 'Avalanche',
    blockExplorerUrls: ['https://snowtrace.io'],
    rpcUrls: [
      'https://avalanche-mainnet.infura.io/v3/bd4216db4b0e471088d366a9eb68fa02',
      'https://rpc.ankr.com/avalanche/12c187efd7ef6e437a404f3b56cd2ef24daeb506b3afc9c9691d75afc98b7183',
      'https://avalanche.public-rpc.com',
      'https://rpc.ankr.com/avalanche',
      'https://avalanche.drpc.org',
      'https://avax-mainnet.gateway.pokt.network/v1/lb/b1853cb0',
      'https://api.avax.network/ext/bc/C/rpc',
      'https://avalanche.public-rpc.com',
      'https://endpoints.omniatech.io/v1/avax/mainnet/public',
      'https://avalanche.public-rpc.com',
      'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
      'https://avalanche.blockpi.network/v1/rpc/public',
      'https://avalanche-c-chain.publicnode.com',
    ],
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'Avalanche',
      decimals: 18,
    },
    iconUrls: ['https://dappos-public-resource.s3.amazonaws.com/chainLogo/chain_43114_icon.png'],
  },
  [ChainIds.ETHEREUM]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    blockExplorerUrls: ['https://etherscan.io'],
    rpcUrls: [
      'https://mainnet.infura.io/v3/bd4216db4b0e471088d366a9eb68fa02',
      'https://rpc.ankr.com/eth/12c187efd7ef6e437a404f3b56cd2ef24daeb506b3afc9c9691d75afc98b7183',
      'https://eth-mainnet.public.blastapi.io',
      'https://rpc.payload.de',
      'https://eth-mainnet.gateway.pokt.network/v1/lb/b1853cb0',
      'https://api.securerpc.com/v1',
      'https://ethereum.blockpi.network/v1/rpc/public',
      'https://eth.drpc.org',
      'https://eth-mainnet.g.alchemy.com/v2/demo',
      'https://eth.llamarpc.com',
    ],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    iconUrls: ['https://dappos-public-resource.s3.amazonaws.com/chainLogo/chain_1_icon.png'],
  },
  [ChainIds.OP]: {
    chainId: '0xa', // 10
    chainName: 'Optimism',
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    rpcUrls: [
      'https://rpc.ankr.com/optimism/12c187efd7ef6e437a404f3b56cd2ef24daeb506b3afc9c9691d75afc98b7183',
      'https://optimism.blockpi.network/v1/rpc/public',
      'https://optimism-mainnet.public.blastapi.io',
      'https://optimism-mainnet.gateway.pokt.network/v1/lb/b1853cb0',
      'https://optimism.meowrpc.com',
      'https://alien-tame-firefly.optimism.discover.quiknode.pro/e406d1013fbe696428f4ae9e77a5a2f48d1426ac',
      'https://rpc.optimism.gateway.fm',
      'https://optimism.drpc.org',
      'https://mainnet.optimism.io',
    ],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    iconUrls: ['https://dappos-public-resource.s3.amazonaws.com/chainLogo/chain_10_icon.png'],
  },
  [ChainIds.MANTA]: {
    chainId: '0xa9', // 169
    chainName: 'Manta',
    blockExplorerUrls: ['https://pacific-explorer.manta.network'],
    rpcUrls: ['https://pacific-rpc.manta.network/http', 'https://1rpc.io/manta'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    iconUrls: ['https://dappos-public-resource.s3.amazonaws.com/chainLogo/chain_169_icon.png'],
  },
  [ChainIds.ARBITRUM]: {
    chainId: '0xa4b1', // 42161
    chainName: 'Arbitrum',
    blockExplorerUrls: ['https://arbiscan.io'],
    rpcUrls: [
      'https://rpc.ankr.com/arbitrum/12c187efd7ef6e437a404f3b56cd2ef24daeb506b3afc9c9691d75afc98b7183',
      'https://1rpc.io/arb',
      'https://arbitrum.llamarpc.com',
      'https://arbitrum.meowrpc.com',
      'https://rpc.ankr.com/arbitrum',
      'https://arbitrum-one.publicnode.com',
      'https://endpoints.omniatech.io/v1/arbitrum/one/public',
    ],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    iconUrls: ['https://dappos-public-resource.s3.amazonaws.com/chainLogo/chain_42161_icon.png'],
  },
}

export function getEvmChainParameter(chainId: ChainIds | string) {
  let res: EvmChainParameter | undefined
  if (typeof chainId !== 'string') {
    res = networks[chainId]
  } else {
    const _chain = `0x${Number(chainId).toString(16)}`
    res = Object.values(networks).find((e) => e.chainId === _chain)
  }
  if (res) {
    res.rpcUrls = res.rpcUrls.filter((rpcURL: string) => !Number(/ankr\.com|infura/.test(rpcURL)))
  }
  return res
}
