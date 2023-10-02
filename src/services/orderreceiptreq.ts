import type { WSMessage, ZZServiceHandler } from 'src/types'

export const orderreceiptreq: ZZServiceHandler = async (
  api,
  ws,
  [chainId, orderId]
) => {
  if (!api.VALID_CHAINS.includes(chainId)) {
    const errorMsg: WSMessage = {
      op: 'error',
      args: [
        'orderreceiptreq',
        `${chainId} is not a valid chain id. Use ${api.VALID_CHAINS}`,
      ],
    }
    if (ws) ws.send(JSON.stringify(errorMsg))
    console.log(`Error, ${chainId} is not a valid chain id.`)
    return errorMsg
  }

  try {
    const orderreceipt = await api.getOrder(chainId, orderId)
    const msg = { op: 'orderreceipt', args: orderreceipt[0] }
    if (ws) ws.send(JSON.stringify(msg))
    return orderreceipt[0]
  } catch (err: any) {
    const errorMsg: WSMessage = { op: 'error', args: ['orderreceiptreq', err.message] }
    if (ws) ws.send(JSON.stringify(errorMsg))
    return errorMsg
  }
}