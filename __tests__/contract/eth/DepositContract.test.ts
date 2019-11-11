import { DepositContract } from '../../../src/contract/eth/DepositContract'
import { Property } from '../../../src/ovm/types'
import * as ethers from 'ethers'
import { Address } from '../../../src/types/Codables'

class MockContract extends ethers.Contract {
  constructor() {
    super('', '[]', ethers.getDefaultProvider())
  }
}

describe('DepositContract', () => {
  const deciderAddress: Address = Address.from(ethers.constants.AddressZero)
  it('should deposit', async () => {
    const depositContract = new DepositContract(new MockContract())
    const stateObject = new Property(deciderAddress, [])
    const result = await depositContract.deposit(0, stateObject)
    expect(result).toEqual(0)
  })
})
