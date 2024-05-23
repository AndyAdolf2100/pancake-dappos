export interface IVwInfo {
  app: string
  chainId: number
  code: string
  data: string
  gasLimit: string
  gasToken: string
  gasTokenPrice: string
  hash: string
  id: number
  insertTime: string
  isGateWay: number
  manager: string
  priorityFee: string
  proof: string
  sender: string
  service: string
  signature: string
  state: number
  text: string
  txId: number
  wallet: string
  workflowHash: string
  failureReason: string
}

export interface IPayInfo {
  id: number
  vaultAddress: string
  amountIn: string
  amountOut: string
  tokenIn: string
  tokenOut: string
  receiver: string
  sender: string
  payOrderId: string
  srcHash: string
  dstHash: string
  workflowHash: string
  state: number
  srcChain: number
  dstChain: number
  code: string
  insertTime: string
  createTxId: number
  executeTxId: number
  orderId: number
  failureReason: string
}

export interface ITxs {
  id: number
  executePays: IPayInfo[]
  vw: IVwInfo
  createPays: IPayInfo[]
  dependenceIds: number[]
}

export interface IOrderInfo {
  txs: ITxs[]
  orderHash: string | boolean
  sender: string
}

export interface IPayItem {
  state: number
}

export interface Tx {
  vw?: {
    state: number
  }
  createPays: IPayItem[]
  executePays: IPayItem[]
}

export interface PollOrderRes {
  state: number
  progress: number | string
  data: IOrderInfo
  isSuccess: boolean
  isFailure: boolean
  isEnd: boolean
  failureReason: string
}

export interface OrderHashParam {
  hash: string
  options?: any
}

export interface TransactionState {
  isPolling: boolean
  process: number | string
  pendingCount: number
  transactions: OrderHashParam[]
  hashSet: any
}
