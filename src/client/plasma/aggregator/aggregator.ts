import { SocketioPubsubServer } from '../../../network'
import { ICommitmentContract } from '../../../contract'
import { BlockManager } from './BlockManager'
import { Transaction } from '../../../models/Transaction'

interface AggregatorOptions {
  port: number
}

export class Aggregator {
  private pubsubServer: SocketioPubsubServer
  private blockManager: BlockManager
  constructor(
    options: AggregatorOptions,
    commitmentContract: ICommitmentContract
  ) {
    this.blockManager = new BlockManager(commitmentContract)
    this.pubsubServer = new SocketioPubsubServer(options.port)
    this.pubsubServer.setRecievingHandler((topic, message) => {
      const transaction = Transaction.decode(message)
      this.blockManager.enqueueTx(transaction)
    })
    setTimeout(() => {
      this.blockManager.submitNextBlock()
    }, 10000)
  }
}
