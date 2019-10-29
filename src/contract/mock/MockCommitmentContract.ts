import { Bytes } from '../../types'
import { ICommitmentContract } from '../interfaces/ICommitmentContract'

export class MockCommitmentContract implements ICommitmentContract {
  constructor() {}
  async submit(blockNumber: number, root: Bytes) {}
}
