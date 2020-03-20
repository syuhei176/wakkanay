import { IERC20DetailedContract } from '@cryptoeconomicslab/contract'
import { Integer, Address } from '@cryptoeconomicslab/primitives'

/**
 * @description TokenManager manages token information
 */
export default class TokenManager {
  private tokenContracts: Map<string, IERC20DetailedContract> = new Map()
  private tokenDecimals: Map<string, Integer> = new Map()

  /**
   * Add Token Contract by Deposit Contract address.
   * @param depositContractAddress The address of Deposit Contract
   * @param erc20Contract Instance of ERC20Contract
   */
  async addTokenContract(
    depositContractAddress: Address,
    erc20Contract: IERC20DetailedContract
  ) {
    this.tokenContracts.set(depositContractAddress.data, erc20Contract)
    const decimals = await erc20Contract.decimals()
    this.tokenDecimals.set(erc20Contract.address.data, decimals)
  }

  /**
   * Get Token Contract by deposit contract address.
   * @param depositContractAddress The address of Deposit Contract
   */
  getTokenContract(
    depositContractAddress: Address
  ): IERC20DetailedContract | undefined {
    return this.tokenContracts.get(depositContractAddress.data)
  }

  /**
   * Get decimal of token by deposit contract address.
   * @param depositContractAddress The address of Deposit Contract
   * @returns Retuens decimal value which indicates how many "0"s there are to the right of the decimal point in token representation.
   */
  getDecimal(depositContractAddress: Address): number {
    const tokenContract = this.getTokenContract(depositContractAddress)
    if (!tokenContract) {
      throw new Error(
        `Token Contract of (${depositContractAddress.data}) not found.`
      )
    }
    const decimals = this.tokenDecimals.get(tokenContract.address.data)
    if (!decimals) {
      throw new Error(
        `Token description(${tokenContract.address.data}) not found.`
      )
    }
    return decimals.data
  }
}
