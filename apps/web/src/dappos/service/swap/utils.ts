import { ethers, utils } from 'ethers'

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
  console.log('values', values)
  return ethers.utils.defaultAbiCoder.encode(types, values)
}

export function encodeExactInputOrOutputForPath(routeAddresses: string[], isExactOut: boolean, feeAmountArr: number[]) {
  console.log('routeAddresses in Manta, feeAmount arr: ', routeAddresses, feeAmountArr)
  if (isExactOut) {
    // eslint-disable-next-line no-param-reassign
    routeAddresses = routeAddresses.reverse()
    // eslint-disable-next-line no-param-reassign
    feeAmountArr = feeAmountArr.reverse()
    console.log('reverse routeAddresses: ', routeAddresses)
  }

  const types = routeAddresses.reduce((typesArr, addressOrIndex, index) => {
    if (index === 0) {
      typesArr.push(utils.isAddress(addressOrIndex) ? 'address' : 'uint8')
    } else {
      typesArr.push('uint24')
      typesArr.push(utils.isAddress(addressOrIndex) ? 'address' : 'uint8')
    }
    return typesArr
  }, [] as string[])

  const values = routeAddresses.reduce((valuesArr, addressOrIndex, index) => {
    if (index === 0) {
      valuesArr.push(addressOrIndex)
    } else {
      const lastIndex = index - 1
      valuesArr.push(feeAmountArr[lastIndex].toString())
      valuesArr.push(addressOrIndex)
    }
    return valuesArr
  }, [] as any[])

  console.log('types in Manta', types)

  console.log('values in Manta', values)

  const executeData = ethers.utils.solidityPack(types, values)
  return executeData
}
