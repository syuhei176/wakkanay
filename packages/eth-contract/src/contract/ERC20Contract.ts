import * as ethers from 'ethers'
import { IERC20DetailedContract } from '@cryptoeconomicslab/contract'
import { Address, BigNumber, Integer } from '@cryptoeconomicslab/primitives'

export class ERC20Contract implements IERC20DetailedContract {
  public static abi = [
    'function approve(address _spender, uint256 _value)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
  ]

  private connection: ethers.Contract

  constructor(readonly address: Address, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      ERC20Contract.abi,
      signer
    )
  }

  public async approve(spender: Address, amount: BigNumber) {
    try {
      await this.connection.approve(spender.data, amount.raw)
    } catch (e) {
      throw new Error(`Invalid call: ${e}`)
    }
  }

  /**
   * name method returns name of PlasmaETH token.
   */
  public async name(): Promise<string> {
    try {
      return await this.connection.name()
    } catch (e) {
      throw new Error(`Invalid call: ${e}. This ERC20 doesn't have name.`)
    }
  }

  /**
   * symbol method returns symbol of PlasmaETH token.
   */
  public async symbol(): Promise<string> {
    try {
      return await this.connection.symbol()
    } catch (e) {
      throw new Error(`Invalid call: ${e}. This ERC20 doesn't have symbol.`)
    }
  }

  /**
   * decimals method returns decimal value of this token.
   * @returns return Integer object of decimal value
   */
  public async decimals(): Promise<Integer> {
    try {
      return Integer.from(await this.connection.decimals())
    } catch (e) {
      throw new Error(`Invalid call: ${e}. This ERC20 doesn't have decimals.`)
    }
  }
}
