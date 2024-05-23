import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { ITxs } from 'dappos/constant/order-types'

const txProgressConfig: Record<
  number,
  Record<
    number,
    {
      maxProgress: number
      maxTime: number
      minProgress: number
    }
  >
> = {
  0: {
    0: { maxProgress: 0, maxTime: 0, minProgress: 0 },
    1: { maxProgress: 70, maxTime: 10, minProgress: 1 },
    2: { maxProgress: 99, maxTime: 30, minProgress: 2 },
    3: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    4: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    5: { maxProgress: 100, maxTime: 0, minProgress: 100 },
  },
  56: {
    0: { maxProgress: 0, maxTime: 0, minProgress: 0 },
    1: { maxProgress: 70, maxTime: 5, minProgress: 1 },
    2: { maxProgress: 99, maxTime: 10, minProgress: 2 },
    3: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    4: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    5: { maxProgress: 100, maxTime: 0, minProgress: 100 },
  },
  137: {
    0: { maxProgress: 0, maxTime: 0, minProgress: 0 },
    1: { maxProgress: 70, maxTime: 10, minProgress: 1 },
    2: { maxProgress: 99, maxTime: 15, minProgress: 2 },
    3: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    4: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    5: { maxProgress: 100, maxTime: 0, minProgress: 100 },
  },
  43114: {
    0: { maxProgress: 0, maxTime: 0, minProgress: 0 },
    1: { maxProgress: 70, maxTime: 10, minProgress: 1 },
    2: { maxProgress: 99, maxTime: 10, minProgress: 2 },
    3: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    4: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    5: { maxProgress: 100, maxTime: 0, minProgress: 100 },
  },
  53935: {
    0: { maxProgress: 0, maxTime: 0, minProgress: 0 },
    1: { maxProgress: 70, maxTime: 10, minProgress: 1 },
    2: { maxProgress: 99, maxTime: 30, minProgress: 2 },
    3: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    4: { maxProgress: 100, maxTime: 0, minProgress: 100 },
    5: { maxProgress: 100, maxTime: 0, minProgress: 100 },
  },
}

type ITXWeight = Record<
  number,
  {
    maxTime: number
  }
>
const txWeightConfig: ITXWeight = Object.fromEntries(
  Object.entries(txProgressConfig).map(([chainId, config]) => {
    return [
      chainId,
      {
        maxTime: Object.values(config)
          .map((e) => e.maxTime)
          .reduce((a, b) => a + b, 0),
      },
    ]
  }),
)

function calculateElapsedSeconds(tx: ITxs) {
  const insertTime = tx.vw?.insertTime ?? tx.createPays[0]?.insertTime ?? tx.executePays[0]?.insertTime
  const currentTime = new Date().getTime()
  const elapsedSeconds = Math.floor((currentTime - dayjs(insertTime).valueOf()) / 1000)
  return elapsedSeconds
}

function calculateTxProgress(tx: ITxs) {
  let state = tx.vw?.state ?? tx.createPays[0]?.state ?? tx.executePays[0]?.state
  if (state === 0 && !tx.vw && tx.dependenceIds.length === 0) {
    // eoa payment tx default state: 1
    state = 1
  }

  const chainId = tx.vw?.chainId ?? tx.createPays[0]?.srcChain ?? tx.executePays[0]?.dstChain ?? 0
  if (txProgressConfig[chainId]) {
    const txConfig = txProgressConfig[chainId]
    if (txConfig[state]) {
      const chainMaxTime = txWeightConfig[chainId].maxTime
      const { maxProgress, minProgress } = txConfig[state]
      const elapsedSeconds = calculateElapsedSeconds(tx)
      const _progress = state === 0 ? 0 : (elapsedSeconds / chainMaxTime) * maxProgress
      const progress = BigNumber.maximum(BigNumber.minimum(_progress, maxProgress), minProgress).toNumber()
      // console.log(
      //   `${chainId} state:${state} progress: ${progress} maxProgress: ${maxProgress} elapsedSeconds: ${elapsedSeconds} maxTime: ${chainMaxTime}`,
      // );
      return {
        progress,
        elapsedSeconds,
        weight: chainMaxTime,
      }
    }
  }
  return {
    progress: 0,
    elapsedSeconds: 0,
    weight: 0,
  }
}

function calculateOrderProgress(txs: ITxs[]) {
  const txProgressList = txs.map((tx) => calculateTxProgress(tx))
  const allWeight = txProgressList.reduce((prev, cur) => {
    return prev.plus(cur.weight)
  }, new BigNumber(0))

  const txProgress = txProgressList.reduce((prev, cur) => {
    return prev.plus(new BigNumber(cur.progress).div(100).times(cur.weight))
  }, new BigNumber(0))
  const orderProgress = txProgress.div(allWeight)

  // console.log(`txProgress: ${txProgress} orderProgress:${orderProgress}`);

  return BigNumber.minimum(orderProgress.times(100), 100).toFixed(2)
}

export { calculateElapsedSeconds, calculateOrderProgress, calculateTxProgress }
