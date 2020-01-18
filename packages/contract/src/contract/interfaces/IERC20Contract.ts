import { Address, Integer } from '@cryptoeconomicslab/primitives'

export interface IERC20Contract {
  address: Address
  /**
   * approve other contract to handle ERC20 balance
   */
  approve(spender: Address, amount: Integer): Promise<void>
}
