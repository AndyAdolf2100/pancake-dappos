import { dehydrate, QueryClient } from '@tanstack/react-query'
import { GetStaticProps } from 'next'
import { getTotalTvl } from 'utils/getTotalTVL'
import { useRouter } from 'next/router'
// import Home from '../views/Home'

const IndexPage = () => {
  // dappOS: replace Home and redirect to swap // TODO style got something wrong when redirect to swap
  window.open(`${window.location.origin}/swap`, '_self')
}

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient()
  const results = await getTotalTvl()
  queryClient.setQueryData(['totalTx30Days'], results.totalTx30Days)
  queryClient.setQueryData(['tvl'], results.tvl)
  queryClient.setQueryData(['addressCount30Days'], results.addressCount30Days)
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60 * 60, // 1 hour
  }
}

IndexPage.chains = []
IndexPage.isShowV4IconButton = true

export default IndexPage
