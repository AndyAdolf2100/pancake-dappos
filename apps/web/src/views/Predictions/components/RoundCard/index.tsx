import { BetPosition } from '@pancakeswap/prediction'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { useGetBetByEpoch, useGetCurrentEpoch } from 'state/predictions/hooks'
import { NodeRound } from 'state/types'
import { useAccount } from 'dappos/hooks/useWagmiHooks' // dappOS
import { getMultiplierV2 } from '../../helpers'
import ExpiredRoundCard from './ExpiredRoundCard'
import LiveRoundCard from './LiveRoundCard'
import OpenRoundCard from './OpenRoundCard'
import SoonRoundCard from './SoonRoundCard'

interface RoundCardProps {
  round: NodeRound
  isActive?: boolean
}

const RoundCard: React.FC<React.PropsWithChildren<RoundCardProps>> = ({ round, isActive }) => {
  const { epoch, lockPrice, closePrice, totalAmount, bullAmount, bearAmount } = round
  const currentEpoch = useGetCurrentEpoch()
  const { address: account } = useAccount()
  const ledger = useGetBetByEpoch(account ?? '0x', epoch)
  const hasEntered = ledger ? ledger.amount > 0n : false
  const hasEnteredUp = hasEntered && ledger?.position === BetPosition.BULL
  const hasEnteredDown = hasEntered && ledger?.position === BetPosition.BEAR
  const hasClaimedUp = hasEntered && ledger?.claimed && ledger.position === BetPosition.BULL
  const hasClaimedDown = hasEntered && ledger?.claimed && ledger.position === BetPosition.BEAR

  // Fake future rounds
  if (epoch > currentEpoch) {
    return <SoonRoundCard round={round} />
  }

  const bullMultiplier = totalAmount && bullAmount ? getMultiplierV2(totalAmount, bullAmount) : BIG_ZERO
  const bearMultiplier = totalAmount && bearAmount ? getMultiplierV2(totalAmount, bearAmount) : BIG_ZERO

  const formattedBullMultiplier = bullMultiplier.toFixed(bullMultiplier.isZero() ? 0 : 2)
  const formattedBearMultiplier = bearMultiplier.toFixed(bearMultiplier.isZero() ? 0 : 2)

  // Next (open) round
  if (epoch === currentEpoch && lockPrice === null) {
    return (
      <OpenRoundCard
        round={round}
        hasEnteredDown={hasEnteredDown}
        hasEnteredUp={hasEnteredUp}
        betAmount={ledger?.amount}
        bullMultiplier={formattedBullMultiplier}
        bearMultiplier={formattedBearMultiplier}
      />
    )
  }

  // Live round
  if (closePrice === null && epoch === currentEpoch - 1) {
    return (
      <LiveRoundCard
        betAmount={ledger?.amount}
        hasEnteredDown={hasEnteredDown}
        hasEnteredUp={hasEnteredUp}
        round={round}
        bullMultiplier={formattedBullMultiplier}
        bearMultiplier={formattedBearMultiplier}
      />
    )
  }

  // Past rounds
  return (
    <ExpiredRoundCard
      isActive={isActive}
      round={round}
      hasEnteredDown={hasEnteredDown}
      hasEnteredUp={hasEnteredUp}
      hasClaimedDown={hasClaimedDown ?? false}
      hasClaimedUp={hasClaimedUp ?? false}
      betAmount={ledger?.amount}
      bullMultiplier={formattedBullMultiplier}
      bearMultiplier={formattedBearMultiplier}
    />
  )
}

export default RoundCard
