import * as React from 'react'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { useEoaBalance, useVwBalance } from 'dappos/hooks/useCurrencyBalance'
import { useMemo, useEffect } from 'react'
import { formatAmount } from '@pancakeswap/utils/formatFractions'

const TooltipContent = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} placement="top" arrow />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: theme.typography.pxToRem(12),
    backgroundColor: 'white',
    minWidth: 240,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    borderRadius: theme.typography.pxToRem(6),
    color: 'rgba(0, 0, 0)',
  },
  [`& .${tooltipClasses.tooltip} .balance-content`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  [`& .${tooltipClasses.tooltip} .balance-content div`]: {
    fontSize: theme.typography.pxToRem(14),
  },
  [`& .${tooltipClasses.tooltip} .balance-content .title-part`]: {
    display: 'flex',
    alignItems: 'center',
    height: 22,
    fontSize: theme.typography.pxToRem(14),
  },
  [`& .${tooltipClasses.tooltip} .balance-content img`]: {
    width: 20,
    marginRight: 6,
  },
  [`& .${tooltipClasses.tooltip} .title`]: {
    fontSize: theme.typography.pxToRem(16),
  },
  [`& .${tooltipClasses.tooltip} span::before`]: {
    backgroundColor: 'white !important',
    border: '1px solid #dadde9',
  },
}))

const DappOSBalanceTooltip = ({ currency, children }) => {
  const vwBalanceCurrencyAmount = useVwBalance(currency)
  const eoaBalanceCurrencyAmount = useEoaBalance(currency)

  useEffect(() => {
    console.log('vwBalanceCurrencyAmount', vwBalanceCurrencyAmount?.toSignificant(6))
  }, [vwBalanceCurrencyAmount])

  useEffect(() => {
    console.log('eoaBalanceCurrencyAmount', eoaBalanceCurrencyAmount?.toSignificant(6))
  }, [eoaBalanceCurrencyAmount])

  const vwBalance = useMemo(() => {
    return currency ? formatAmount(vwBalanceCurrencyAmount, 6) : 0
  }, [vwBalanceCurrencyAmount, currency])

  const eoaBalance = useMemo(() => {
    return currency ? formatAmount(eoaBalanceCurrencyAmount, 6) : 0
  }, [eoaBalanceCurrencyAmount, currency])

  const vwCurrencySymbol = useMemo(() => {
    return vwBalanceCurrencyAmount?.currency.symbol.toUpperCase() ?? ''
  }, [vwBalanceCurrencyAmount])

  const eoaCurrencySymbol = useMemo(() => {
    return eoaBalanceCurrencyAmount?.currency.symbol.toUpperCase() ?? ''
  }, [eoaBalanceCurrencyAmount])

  return (
    <TooltipContent
      title={
        <>
          <div className="title">Contains</div>
          <div className="balance-content">
            <div className="title-part">
              <img src="/dappos/assets/dappos.svg" alt="dappos" />
              dappOS:
            </div>
            <div>
              {vwBalance ?? 0}&nbsp;
              {vwCurrencySymbol}
            </div>
          </div>
          <div className="balance-content">
            <div className="title-part">
              <img src="dappos/assets/metamask.svg" alt="metamask" />
              MetaMask:
            </div>
            <div>
              {eoaBalance ?? 0}&nbsp;
              {eoaCurrencySymbol}
            </div>
          </div>
        </>
      }
    >
      <div style={{ textDecoration: 'underline', textDecorationColor: '#00000060', textUnderlineOffset: '2px' }}>
        {children}
      </div>
    </TooltipContent>
  )
}

export default DappOSBalanceTooltip
