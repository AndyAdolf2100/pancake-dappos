// FOR V2.0 SDK
import { useDappOSProtocol } from 'state/dappos/hooks'
import { useDappOSInstitution } from 'state/dapposInstitution/hooks'
import DappOSProtocol from '@dappos/checkout'
import { nameConsole } from './namespaceConsole'

export const usePackedSdk = () => {
  const { readyProtocol } = useDappOSProtocol()
  const { isSwapModeNormal, isInstitutionSigner, institutionAccountId } = useDappOSInstitution()

  /**
   * @description all tranaction excpet withdraw to eoa
   * @param params
   * @param isSimulated
   * @param operationType it's console title
   * @param isIsolated it's using single chain token
   * @returns
   */
  const sendTransaction = async (params: any, isSimulated: boolean, operationType: string, isIsolated?: boolean) => {
    // const { institutionState } = useInstitutionStore();
    const protocol = (await readyProtocol()) as DappOSProtocol
    try {
      let res
      if (isSimulated) {
        console.time('dappos simulate !!!!')
        const p = {
          useEoaAccount: isSwapModeNormal, // institution mode can't use eoa
          ...params,
        }
        res = await protocol.simulate.sendTransaction(p)
        console.timeEnd('dappos simulate !!!!')
      } else if (isIsolated) {
        // handle token that is not in whitelist, balance need to be combined with eoa and vw
        const order = await protocol.executeIsolateOrderETH(params)
        res = order.orderHash
      } else {
        // institutionSigner
        // eslint-disable-next-line no-lonely-if
        if (isInstitutionSigner) {
          const p = {
            institutionParam: {
              wallet_owner_id: Number(institutionAccountId),
              text: params.text,
            },
            ...params,
          }
          console.log('signer params: ', p)
          // api return undefined
          await protocol.sendInstitutionTransaction(p)
          res = true
        } else {
          res = await protocol.sendTransaction(params)
        }
      }
      dynamicConsole(isSimulated, operationType, 'result: ', res)
      return res
    } catch (error) {
      dynamicConsole(isSimulated, operationType, 'result: ', error, 'error')
      throw error
    }
  }

  const dynamicConsole = (
    isSimulated: boolean,
    operationType: string,
    desc?: string,
    content?: unknown,
    consoleType?: string,
  ) => {
    const prefix = isSimulated ? 'Simulated - ' : ''
    return nameConsole(prefix + operationType, desc, content, consoleType)
  }

  return {
    sendTransaction,
  }
}
