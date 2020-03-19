import {
  IERC20Contract,
  IERC20DetailedContract
} from '@cryptoeconomicslab/contract'
import { Integer, Address } from '@cryptoeconomicslab/primitives'

/**
 * @description TokenManager manages token information
 */
export default class TokenManager {
  private tokenDecimals: Map<string, Integer> = new Map()

  async addTokenContract(erc20Contract: IERC20DetailedContract) {
    const decimals = await erc20Contract.decimals()
    this.tokenDecimals.set(erc20Contract.address.data, decimals)
  }

  getDecimal(tokenAddress: Address): number {
    const decimals = this.tokenDecimals.get(tokenAddress.data)
    if (!decimals) {
      throw new Error(`Token description(${tokenAddress.data}) not found.`)
    }
    return decimals.data
  }
}
