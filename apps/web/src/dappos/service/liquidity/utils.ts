import { ethers } from 'ethers'

export const Actions = {
  MintNewPosition: 3,
  IncreaseLiquidity: 4,
  DecreaseLiquidity: 5,
}

export const genMintPositionData = (options: {
  token0: string
  token1: string
  fee: string
  tickLower: string
  tickUpper: string
  amount0Desired: string
  amount1Desired: string
  amount0Min: string
  amount1Min: string
}) => {
  const { token0, token1, fee, tickLower, tickUpper, amount0Desired, amount1Desired, amount0Min, amount1Min } = options
  const types = ['address', 'address', 'uint24', 'int24', 'int24', 'uint256', 'uint256', 'uint256', 'uint256']
  const values = [token0, token1, fee, tickLower, tickUpper, amount0Desired, amount1Desired, amount0Min, amount1Min]
  return ethers.utils.defaultAbiCoder.encode(types, values)
}

export const genIncreasePositionData = (options: {
  tokenId: string
  amount0Desired: string
  amount1Desired: string
  amount0Min: string
  amount1Min: string
}) => {
  const { tokenId, amount0Desired, amount1Desired, amount0Min, amount1Min } = options
  const types = ['uint256', 'uint256', 'uint256', 'uint256', 'uint256']
  const values = [tokenId, amount0Desired, amount1Desired, amount0Min, amount1Min]
  return ethers.utils.defaultAbiCoder.encode(types, values)
}

export const genDecreasePositionData = (options: {
  tokenId: string
  liquidity: string
  amount0Min: string
  amount1Min: string
}) => {
  const { tokenId, liquidity, amount0Min, amount1Min } = options
  const types = ['uint256', 'uint128', 'uint256', 'uint256']
  const values = [tokenId, liquidity, amount0Min, amount1Min]
  return ethers.utils.defaultAbiCoder.encode(types, values)
}
