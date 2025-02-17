import { Box, Text, Flex, Card, CardBody, CardHeader, Heading, Progress, Skeleton } from '@pancakeswap/uikit'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import { useAccount } from 'dappos/hooks/useWagmiHooks' // dappOS
import { Vote } from 'state/types'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { useTranslation } from '@pancakeswap/localization'
import { FetchStatus, TFetchStatus } from 'config/constants/types'
import { calculateVoteResults, getTotalFromVotes } from '../helpers'
import TextEllipsis from '../components/TextEllipsis'

const { VotedTag } = FarmWidget.Tags

interface ResultsProps {
  choices: string[]
  votes: Vote[]
  votesLoadingStatus: TFetchStatus
}

const Results: React.FC<React.PropsWithChildren<ResultsProps>> = ({ choices, votes, votesLoadingStatus }) => {
  const { t } = useTranslation()
  const results = calculateVoteResults(votes)
  const { address: account } = useAccount()
  const totalVotes = getTotalFromVotes(votes)

  return (
    <Card>
      <CardHeader>
        <Heading as="h3" scale="md">
          {t('Current Results')}
        </Heading>
      </CardHeader>
      <CardBody>
        {votesLoadingStatus === FetchStatus.Fetched &&
          choices.map((choice, index) => {
            const choiceVotes = results[choice] || []
            const totalChoiceVote = getTotalFromVotes(choiceVotes)
            const progress = totalVotes === 0 ? 0 : (totalChoiceVote / totalVotes) * 100
            const hasVoted = choiceVotes.some((vote) => {
              return account && vote.voter.toLowerCase() === account.toLowerCase()
            })

            return (
              <Box key={choice} mt={index > 0 ? '24px' : '0px'}>
                <Flex alignItems="center" mb="8px">
                  <TextEllipsis mb="4px" title={choice}>
                    {choice}
                  </TextEllipsis>
                  {hasVoted && <VotedTag mr="4px" />}
                </Flex>
                <Box mb="4px">
                  <Progress primaryStep={progress} scale="sm" />
                </Box>
                <Flex alignItems="center" justifyContent="space-between">
                  <Text color="textSubtle">{t('%total% Votes', { total: formatNumber(totalChoiceVote, 0, 2) })}</Text>
                  <Text>
                    {progress.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </Text>
                </Flex>
              </Box>
            )
          })}

        {votesLoadingStatus === FetchStatus.Fetching &&
          choices.map((choice, index) => {
            return (
              <Box key={choice} mt={index > 0 ? '24px' : '0px'}>
                <Flex alignItems="center" mb="8px">
                  <TextEllipsis mb="4px" title={choice}>
                    {choice}
                  </TextEllipsis>
                </Flex>
                <Box mb="4px">
                  <Skeleton height="36px" mb="4px" />
                </Box>
              </Box>
            )
          })}
      </CardBody>
    </Card>
  )
}

export default Results
