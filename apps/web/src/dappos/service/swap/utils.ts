import { ethers } from 'ethers'

export const Actions = {
  SwapExactInput: 1,
  SwapExactOutput: 2,
}

export const genExactInData = (options: { path: string; amountIn: string; amountOutMin: string }) => {
  const { path, amountIn, amountOutMin } = options
  const types = ['bytes', 'uint256', 'uint256']
  const values = [path, amountIn, amountOutMin]
  return ethers.utils.defaultAbiCoder.encode(types, values)
}

export const genExactOutData = (options: { path: string; amountOut: string; amountInMax: string }) => {
  const { path, amountOut, amountInMax } = options
  const types = ['bytes', 'uint256', 'uint256']
  const values = [path, amountOut, amountInMax]
  return ethers.utils.defaultAbiCoder.encode(types, values)
}
