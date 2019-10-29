import { BlockManager } from '../../../../src/client/plasma/aggregator/BlockManager'
import {
  MockCommitmentContract,
  ICommitmentContract
} from '../../../../src/contract'
import { Transaction } from '../../../../src/models/Transaction'

jest.mock('../../../../src/contract')

describe('BlockManager', () => {
  let commitmentContract = new MockCommitmentContract()
  beforeEach(() => {})
  describe('enqueueTx', () => {
    it('suceed to enqueueTx', async () => {
      // Uses mock commitment contract wrapper
      const blockManager = new BlockManager(commitmentContract)
      const result = await blockManager.enqueueTx(
        new Transaction({ deciderAddress: '', inputs: [] })
      )
      expect(result).not.toBeNull()
    })
  })
  describe('enqueueStateUpdate', () => {
    it('suceed to enqueueStateUpdate', async () => {
      const blockManager = new BlockManager(commitmentContract)
      const result = await blockManager.enqueueStateUpdate()
      expect(result).not.toBeNull()
    })
  })
  describe('submitNextBlock', () => {
    it('suceed to submitNextBlock', async () => {
      const blockManager = new BlockManager(commitmentContract)
      await blockManager.submitNextBlock()
      // commitmentContract.submit() should be called
      expect(MockCommitmentContract).toHaveBeenCalledWith()
    })
  })
  describe('getBlock', () => {
    it('suceed to getBlock', async () => {
      const blockManager = new BlockManager(commitmentContract)
      const blockNumber = 10
      const block = await blockManager.getBlock(blockNumber)
      expect(block).not.toBeNull()
    })
  })
})
