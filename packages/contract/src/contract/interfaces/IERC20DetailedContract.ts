import { Integer } from '@cryptoeconomicslab/primitives'
import { IERC20Contract } from './IERC20Contract'

/**
 * @description IERC20DetailedContract is extended interface of ERC20 which includes token name, description and decimals.
 *     Please see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20Detailed.sol
 */
export interface IERC20DetailedContract extends IERC20Contract {
  /**
   * The name of the token.
   */
  name(): Promise<string>

  /**
   * The symbol of the token.
   */
  symbol(): Promise<string>

  /**
   * Decimals indicates how many "0"s there are to the right of the decimal point.
   * In most tokens, decimals are set 18.
   */
  decimals(): Promise<Integer>
}
