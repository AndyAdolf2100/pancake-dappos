type IErrorKey = Record<string, string>
export const ERROR_CODE: IErrorKey = {
  E1: 'Invalid Signature',

  E2: 'Tx Exists, code has already been used',

  E3: 'Not the dst chain',

  E4: 'New owner already has a wallet',

  E5: 'Rejected by resetter',

  E6: 'Time expire',

  E7: 'Payment id exists',

  E8: 'Payment src chain error or expired',

  E9: 'Incorrect node or input order info',

  E10: 'VW delegate call failed',

  E11: 'Address not exists',

  E12: 'Caller is not the vwm',

  E13: 'GasLimit not enough',

  E14: 'Invalid ChainId',

  E15: 'Payfee failed',

  E16: 'VWManager service payfee failed',

  E17: 'New wallet already has a owner',

  E18: 'msg.value not right',

  E19: 'recover address is address(0)',

  E20: '_feeReceiver is address(0)',

  E21: '_feePortion is limited in 10000',
}
