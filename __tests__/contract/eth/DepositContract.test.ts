import { DepositContract } from '../../../src/contract/eth/DepositContract'
import { Property } from '../../../src/ovm/types'
import * as ethers from 'ethers'
import { Address, Integer } from '../../../src/types/Codables'
import { MockContract } from './MockContract'

describe('DepositContract', () => {
  const deciderAddress: Address = Address.from(ethers.constants.AddressZero)
  describe('deposit', () => {
    it('should suceed to deposit', async () => {
      const depositContract = new DepositContract(new MockContract())
      const stateObject = new Property(deciderAddress, [])
      await expect(depositContract.deposit(Integer.from(123), stateObject))
        .resolves
    })
  })
})
