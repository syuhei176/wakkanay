import { Address, BigNumber } from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'

/**
 * OwnershipPayoutContract interface
 */
export interface IOwnershipPayoutContract {
  finalizeExit(
    depositContractAddress: Address,
    exitProperty: Property,
    depositedRangeId: BigNumber,
    owner: Address
  ): Promise<void>
}
