import * as React from 'react'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'

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
            <div>0</div>
          </div>
          <div className="balance-content">
            <div className="title-part">
              <img src="dappos/assets/metamask.svg" alt="metamask" />
              MetaMask:
            </div>
            <div>0</div>
          </div>
        </>
      }
    >
      <div>{children}</div>
    </TooltipContent>
  )
}

export default DappOSBalanceTooltip
