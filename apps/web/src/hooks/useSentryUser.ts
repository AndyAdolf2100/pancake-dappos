import { setUser } from '@sentry/nextjs'
import { useEffect } from 'react'
import { useAccount } from 'dappos/hooks/useWagmiHooks' // dappOS

function useSentryUser() {
  const { address: account } = useAccount()
  useEffect(() => {
    if (account) {
      setUser({ account })
    }
  }, [account])
}

export default useSentryUser
