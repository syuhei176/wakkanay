import * as ethers from 'ethers'
import { IERC20DetailedContract } from '@cryptoeconomicslab/contract'
import { Address, BigNumber, Integer } from '@cryptoeconomicslab/primitives'

export class PETHContract implements IERC20DetailedContract {
  public static abi = [
    'function approve(address _spender, uint256 _value)',
    'function wrap(uint256 _amount) payable',
    'function unwrap(uint256 _amount)',
    'function decimals() view returns (uint8)'
  ]

  private connection: ethers.Contract

  constructor(readonly address: Address, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      PETHContract.abi,
      signer
    )
  }

  /**
   * @name approve
   * @param spender address who is allowed to spend token
   * @param amount amount of wei.
   */
  public async approve(spender: Address, amount: BigNumber) {
    const bigNumberifiedAmount = new ethers.utils.BigNumber(
      amount.data.toString()
    )
    try {
      await this.connection.wrap(bigNumberifiedAmount, {
        value: bigNumberifiedAmount
      })
      await this.connection.approve(spender.data, bigNumberifiedAmount)
    } catch (e) {
      await this.connection.unwrap(bigNumberifiedAmount)
      throw new Error(`Invalid call: ${e}`)
    }
  }

  /**
   * decimals method returns decimal value of PlasmaETH token.
   * @returns return Integer object of decimal value. It returns 18.
   */
  public async decimals(): Promise<Integer> {
    try {
      return Integer.from(await this.connection.decimals())
    } catch (e) {
      throw new Error(
        `Invalid call: ${e}. This PETHContract doesn't have decimals.`
      )
    }
  }
}
