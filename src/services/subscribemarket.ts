import type { ZZServiceHandler, ZZMarketSummary, ZZMarketInfo, WSMessage } from 'src/types'

// subscribemarket operations should be very conservative
// this function gets called like 10k times in 2 seconds on a restart
// so if any expensive functionality is in here it will result in a
// infinite crash loop
// we disabled lastprice and getLiquidity calls in here because they
// were too expensive
// those are run once and broadcast to each user in the background.ts file now
export const subscribemarket: ZZServiceHandler = async (
  api,
  ws,
  [chainId, market, UTCFlag]
) => {
  if (!api.VALID_CHAINS.includes(chainId)) {
    const errorMsg: WSMessage = {
      op: 'error',
      args: [
        'subscribemarket',
        `${chainId} is not a valid chain id. Use ${api.VALID_CHAINS}`,
      ],
    }
    ws.send(JSON.stringify(errorMsg))
    return
  }

  try {
    const marketSummary: ZZMarketSummary = (
      await api.getMarketSummarys(chainId, [market], UTCFlag)
    )[market]
    if (marketSummary) {
      const marketSummaryMsg = {
        op: 'marketsummary',
        args: [
          marketSummary.market,
          marketSummary.lastPrice,
          marketSummary.highestPrice_24h,
          marketSummary.lowestPrice_24h,
          marketSummary.priceChange,
          marketSummary.baseVolume,
          marketSummary.quoteVolume,
        ],
      }
      ws.send(JSON.stringify(marketSummaryMsg))
    } else {
      const errorMsg: WSMessage = {
        op: 'error',
        args: ['subscribemarket', `Can not find marketSummary for ${market}`],
      }
      ws.send(JSON.stringify(errorMsg))
    }

    let marketInfo: ZZMarketInfo
    try {
      marketInfo = await api.getMarketInfo(market, chainId)
    } catch (e: any) {
      const errorMsg: WSMessage = {
        op: 'error',
        args: [
          'subscribemarket',
          `Can not get marketinfo for ${market}, ${e.message}`,
        ],
      }
      ws.send(JSON.stringify(errorMsg))
      return
    }

    if (marketInfo) {
      const marketInfoMsg = { op: 'marketinfo', args: [marketInfo] }
      ws.send(JSON.stringify(marketInfoMsg))
    } else {
      const errorMsg: WSMessage = {
        op: 'error',
        args: ['subscribemarket', `Can not find market ${market}`],
      }
      ws.send(JSON.stringify(errorMsg))
      return
    }

    const openorders = await api.getopenorders(chainId, market)
    ws.send(JSON.stringify({ op: 'orders', args: [openorders] }))

    try {
      const fillsString = await api.redis.GET(
        `recenttrades:${chainId}:${market}`
      )
      if (fillsString)
        ws.send(
          JSON.stringify({ op: 'fills', args: [JSON.parse(fillsString)] })
        )
    } catch (e: any) {
      const errorMsg: WSMessage = {
        op: 'error',
        args: [
          'subscribemarket',
          `Can not get recenttrades for ${market}, ${e.message}`,
        ],
      }
      ws.send(JSON.stringify(errorMsg))
      return
    }
  } catch (e: any) {
    console.error(e.message)
    const errorMsg: WSMessage = { op: 'error', args: ['subscribemarket', e.message] }
    ws.send(JSON.stringify(errorMsg))
  }

  ws.marketSubscriptions.push(`${chainId}:${market}`)
}