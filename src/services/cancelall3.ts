import type { WSMessage, ZZServiceHandler } from 'src/types'

export const cancelall3: ZZServiceHandler = async (
  api,
  ws,
  [chainId, userId, tokenArray]
) => {
  if (!api.VALID_CHAINS.includes(chainId) && Number(chainId) !== 0) {
    const errorMsg: WSMessage = {
      op: 'error',
      args: [
        'cancelall3',
        `${chainId} is not a valid chain id. Use ${api.VALID_CHAINS} or 0 to cancel on all networks`,
      ],
    }
    ws.send(JSON.stringify(errorMsg))
    console.log(`Error, ${chainId} is not a valid chain id.`)
    return
  }
  userId = typeof userId === 'number' ? userId.toString() : userId

  try {
    const cancelResult: boolean = await api.cancelAllOrders3(chainId, userId, tokenArray)
    if (!cancelResult) throw new Error('Unexpected error')
  } catch (e: any) {
    console.error(e)
    ws.send(
      JSON.stringify({ op: 'error', args: ['cancelall3', e.message, userId] })
    )
  }
}