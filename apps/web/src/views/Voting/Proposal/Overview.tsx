import { useTranslation } from '@pancakeswap/localization'
import { ArrowBackIcon, Box, Button, Flex, Heading, NotFound, ReactMarkdown } from '@pancakeswap/uikit'
import { useQuery } from '@tanstack/react-query'
import Container from 'components/Layout/Container'
import PageLoader from 'components/Loader/PageLoader'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { ProposalState } from 'state/types'
import { getAllVotes, getProposal } from 'state/voting/helpers'
import { useAccount } from 'dappos/hooks/useWagmiHooks' // dappOS
import Layout from '../components/Layout'
import { ProposalStateTag, ProposalTypeTag } from '../components/Proposals/tags'
import { isCoreProposal } from '../helpers'
import Details from './Details'
import Results from './Results'
import Vote from './Vote'
import Votes from './Votes'

const Overview = () => {
  const { query, isFallback } = useRouter()
  const id = query.id as string
  const { t } = useTranslation()
  const { address: account } = useAccount()

  const {
    status: proposalLoadingStatus,
    data: proposal,
    error,
  } = useQuery({
    queryKey: ['voting', 'proposal', id],
    queryFn: () => getProposal(id),
    enabled: Boolean(id),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const {
    status: votesLoadingStatus,
    data,
    refetch,
  } = useQuery({
    queryKey: ['voting', 'proposal', proposal, 'votes'],
    queryFn: async () => {
      if (!proposal) {
        throw new Error('No proposal')
      }
      return getAllVotes(proposal)
    },
    enabled: Boolean(proposal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const votes = useMemo(() => data || [], [data])

  const hasAccountVoted = account && votes && votes.some((vote) => vote.voter.toLowerCase() === account.toLowerCase())

  const isPageLoading = votesLoadingStatus === 'pending' || proposalLoadingStatus === 'pending'

  if (!proposal && error) {
    return (
      <NotFound LinkComp={Link}>
        <NextSeo title="404" />
      </NotFound>
    )
  }

  if (isFallback || !proposal) {
    return <PageLoader />
  }

  return (
    <Container py="40px">
      <Box mb="40px">
        <Link href="/voting" passHref>
          <Button variant="text" startIcon={<ArrowBackIcon color="primary" width="24px" />} px="0">
            {t('Back to Vote Overview')}
          </Button>
        </Link>
      </Box>
      <Layout>
        <Box>
          <Box mb="32px">
            <Flex alignItems="center" mb="8px">
              <ProposalStateTag proposalState={proposal.state} />
              <ProposalTypeTag isCoreProposal={isCoreProposal(proposal)} ml="8px" />
            </Flex>
            <Heading as="h1" scale="xl" mb="16px">
              {proposal.title}
            </Heading>
            <Box>
              <ReactMarkdown>{proposal.body}</ReactMarkdown>
            </Box>
          </Box>
          {!isPageLoading && !hasAccountVoted && proposal.state === ProposalState.ACTIVE && (
            <Vote proposal={proposal} onSuccess={refetch} mb="16px" />
          )}
          <Votes
            votes={votes || []}
            totalVotes={votes?.length ?? proposal.votes}
            votesLoadingStatus={votesLoadingStatus}
          />
        </Box>
        <Box position="sticky" top="60px">
          <Details proposal={proposal} />
          <Results choices={proposal.choices} votes={votes || []} votesLoadingStatus={votesLoadingStatus} />
        </Box>
      </Layout>
    </Container>
  )
}

export default Overview
