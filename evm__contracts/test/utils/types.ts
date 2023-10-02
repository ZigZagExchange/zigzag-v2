import { BigNumber } from "ethers";

export interface Order {
    user: string,
    sellToken: string,
    buyToken: string,
    relayerAddress: string,
    sellAmount: BigNumber,
    buyAmount: BigNumber,
    gasFee: BigNumber,
    expirationTimeSeconds: BigNumber,
    salt: BigNumber
}