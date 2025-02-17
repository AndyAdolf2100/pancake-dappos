import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, InjectedModalProps, Modal, ModalBody, Text } from '@pancakeswap/uikit'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { clearAllTransactions } from 'state/transactions/actions'
import { useAllSortedRecentTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { chains } from 'utils/wagmi'
import { useAccount } from 'dappos/hooks/useWagmiHooks' // dappOS
import ConnectWalletButton from '../../ConnectWalletButton'
import { AutoRow } from '../../Layout/Row'
import Transaction from './Transaction'

function renderTransactions(transactions: TransactionDetails[], chainId: number) {
  return (
    <Flex flexDirection="column">
      {transactions.map((tx) => {
        return <Transaction key={tx.hash + tx.addedTime} tx={tx} chainId={chainId} />
      })}
    </Flex>
  )
}

const TransactionsModal: React.FC<React.PropsWithChildren<InjectedModalProps>> = ({ onDismiss }) => {
  const { address: account } = useAccount()
  const dispatch = useAppDispatch()
  const sortedRecentTransactions = useAllSortedRecentTransactions()

  const { t } = useTranslation()

  const hasTransactions = !isEmpty(sortedRecentTransactions)

  const clearAllTransactionsCallback = useCallback(() => {
    dispatch(clearAllTransactions())
  }, [dispatch])

  return (
    <Modal title={t('Recent Transactions')} headerBackground="gradientCardHeader" onDismiss={onDismiss}>
      {account ? (
        <ModalBody>
          {hasTransactions ? (
            <>
              <AutoRow mb="1rem" style={{ justifyContent: 'space-between' }}>
                <Text>{t('Recent Transactions')}</Text>
                <Button variant="tertiary" scale="xs" onClick={clearAllTransactionsCallback}>
                  {t('clear all')}
                </Button>
              </AutoRow>
              {Object.entries(sortedRecentTransactions).map(([chainId, transactions]) => {
                const chainIdNumber = Number(chainId)
                const groupedTransactions = groupBy(Object.values(transactions), (trxDetails) =>
                  Boolean(trxDetails.receipt),
                )

                const confirmed = groupedTransactions.true ?? []
                const pending = groupedTransactions.false ?? []

                return (
                  <div key={`transactions#${chainIdNumber}`}>
                    <Text fontSize="12px" color="textSubtle" mb="4px">
                      {chains.find((c) => c.id === chainIdNumber)?.name ?? 'Unknown network'}
                    </Text>
                    {renderTransactions(pending, chainIdNumber)}
                    {renderTransactions(confirmed, chainIdNumber)}
                  </div>
                )
              })}
            </>
          ) : (
            <Text>{t('No recent transactions')}</Text>
          )}
        </ModalBody>
      ) : (
        <ConnectWalletButton />
      )}
    </Modal>
  )
}

export default TransactionsModal
