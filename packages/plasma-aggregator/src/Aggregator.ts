import express, { Express, Request, Response } from 'express'
import {
  CompiledPredicate,
  DeciderManager,
  Property,
  DeciderConfig
} from '@cryptoeconomicslab/ovm'
import {
  Address,
  Bytes,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import {
  StateUpdate,
  Transaction,
  TransactionReceipt,
  DepositTransaction,
  TRANSACTION_STATUS,
  Block,
  PlasmaContractConfig
} from '@cryptoeconomicslab/plasma'
import { KeyValueStore, getWitnesses } from '@cryptoeconomicslab/db'
import {
  ICommitmentContract,
  IDepositContract
} from '@cryptoeconomicslab/contract'
import { Wallet } from '@cryptoeconomicslab/wallet'

import { decodeStructable } from '@cryptoeconomicslab/coder'
import JSBI from 'jsbi'

import { BlockManager, StateManager } from './managers'
import { sleep } from './utils'
import cors from 'cors'
import {
  createTxHint,
  createSignatureHint
} from '@cryptoeconomicslab/ovm/lib/hintString'

export default class Aggregator {
  readonly decider: DeciderManager
  private depositContracts: IDepositContract[] = []
  private commitmentContract: ICommitmentContract
  private httpServer: Express
  private ownershipPredicate: CompiledPredicate
  private option: {
    isSubmitter: boolean
    port: number
    blockInterval: number
  }

  /**
   * instantiate aggregator
   * @param kvs key value store isntance
   */
  constructor(
    private wallet: Wallet,
    private stateManager: StateManager,
    private blockManager: BlockManager,
    private witnessDb: KeyValueStore,
    private depositContractFactory: (address: Address) => IDepositContract,
    commitmentContractFactory: (address: Address) => ICommitmentContract,
    config: DeciderConfig & PlasmaContractConfig,
    {
      isSubmitter = false,
      port = 3000,
      blockInterval = 15000
    }: {
      isSubmitter?: boolean
      port?: number
      blockInterval?: number
    }
  ) {
    this.option = {
      isSubmitter,
      port,
      blockInterval
    }
    this.decider = new DeciderManager(witnessDb, ovmContext.coder)
    this.commitmentContract = commitmentContractFactory(
      Address.from(config.commitmentContract)
    )
    this.decider.loadJson(config)
    const ownershipPredicate = this.decider.compiledPredicateMap.get(
      'Ownership'
    )
    if (ownershipPredicate === undefined) {
      throw new Error('Ownership not found')
    }
    this.ownershipPredicate = ownershipPredicate
    this.httpServer = express()
    this.httpServer.use(express.json())
    this.httpServer.use(cors())
  }

  /**
   * start running http server and watching for deposit contracts deposit events
   */
  public run() {
    this.runHttpServer()
    if (this.option.isSubmitter) {
      this.poll()
    }
  }

  /**
   * start http server
   */
  private runHttpServer() {
    this.httpServer.post('/send_tx', this.handleSendTransaction.bind(this))
    this.httpServer.get('/sync_state', this.handleGetSyncState.bind(this))
    this.httpServer.get('/block', this.handleGetBlock.bind(this))
    this.httpServer.get(
      '/inclusion_proof',
      this.handleGetInclusionProof.bind(this)
    )
    this.httpServer.get(
      '/checkpoint_witness',
      this.handleGetCheckpointWitness.bind(this)
    )
    this.httpServer.listen(this.option.port, () =>
      console.log(`server is listening on port ${this.option.port}!`)
    )
  }

  // TODO: what if part of the transactions are invalid?
  private async handleSendTransaction(req: Request, res: Response) {
    const { data } = req.body
    const transactions: string[] = Array.isArray(data) ? data : [data]
    const nextBlockNumber = await this.blockManager.getNextBlockNumber()

    Promise.all(
      transactions.map(async d => {
        try {
          const decodedStruct = ovmContext.coder.decode(
            Transaction.getParamTypes(),
            Bytes.fromHexString(d)
          )
          const tx = Transaction.fromStruct(decodedStruct)
          const receipt = await this.ingestTransaction(tx)
          return receipt
        } catch (e) {
          // return null transaction receipt with status is FALSE when error occur while decoding.
          return new TransactionReceipt(
            TRANSACTION_STATUS.FALSE,
            nextBlockNumber,
            [],
            new Range(BigNumber.default(), BigNumber.default()),
            Address.default(),
            Address.default(),
            Bytes.default()
          )
        }
      })
    )
      .then(receipts => {
        res.send(
          receipts.map(receipt =>
            ovmContext.coder.encode(receipt.toStruct()).toHexString()
          )
        )
        res.status(201)
        res.end()
      })
      .catch(() => {
        res.status(422)
        res.end()
      })
  }

  private handleGetSyncState(req: Request, res: Response) {
    let addr, depositContractAddress
    const blockNumber = req.query.blockNumber
      ? BigNumber.from(Number(req.query.blockNumber))
      : undefined

    try {
      addr = Address.from(req.query.address)
      depositContractAddress = Address.from(req.query.address)
    } catch (e) {
      return res.status(400).end()
    }
    this.stateManager
      .queryOwnershipyStateUpdates(
        depositContractAddress,
        this.ownershipPredicate.deployedAddress,
        addr,
        blockNumber
      )
      .then(data => {
        res.send(
          data.map(s =>
            ovmContext.coder.encode(s.property.toStruct()).toHexString()
          )
        )
        res.status(200).end()
      })
      .catch(e => {
        console.log(e)
        res.status(500).end()
      })
  }

  private handleGetBlock(req: Request, res: Response) {
    try {
      const blockNumber = BigNumber.from(req.query.blockNumber)
      this.blockManager.getBlock(blockNumber).then(block => {
        if (!block) {
          res.status(404).end()
          return
        }

        res.send({
          data: ovmContext.coder.encode(block.toStruct()).toHexString()
        })
        res.status(200).end()
      })
    } catch (e) {
      console.log(e)
      res.status(400).end()
    }
  }

  private handleGetInclusionProof(req: Request, res: Response) {
    try {
      const blockNumber = BigNumber.from(req.query.blockNumber)
      const stateUpdateByte = Bytes.fromHexString(req.query.stateUpdate)
      const stateUpdate = StateUpdate.fromProperty(
        decodeStructable(Property, ovmContext.coder, stateUpdateByte)
      )
      this.blockManager.getBlock(blockNumber).then(block => {
        if (!block) {
          console.log('block not found')
          res.status(404)
          res.end()
          return
        }
        const proof = block.getInclusionProof(stateUpdate)
        if (!proof) {
          console.log('proof not found')
          res.status(404)
          res.end()
          return
        }
        res.send({
          data: ovmContext.coder.encode(proof.toStruct()).toHexString()
        })
        res.status(200).end()
      })
    } catch (e) {
      console.log('not found because', e)
      res.status(404).end()
    }
  }

  /**
   * get inclusion proofs for given range of stateUpdates until
   * blockNumber specified with request parameter
   */
  private async handleGetCheckpointWitness(req: Request, res: Response) {
    const { coder } = ovmContext
    let blockNumber: BigNumber, range: Range, address: Address
    try {
      blockNumber = BigNumber.from(req.query.blockNumber)
      range = decodeStructable(
        Range,
        coder,
        Bytes.fromHexString(req.query.range)
      )
      address = Address.from(req.query.address)
    } catch (e) {
      res
        .status(400)
        .send('Invalid request arguments')
        .end()
      return
    }

    // get inclusionProofs
    let witnesses: Array<{
      stateUpdate: string
      transactions: Array<{ tx: string; witness: string }>
      inclusionProof: string
    }> = []
    for (
      let b = JSBI.BigInt(0);
      JSBI.lessThanOrEqual(blockNumber.data, b);
      b = JSBI.add(b, JSBI.BigInt(1))
    ) {
      const block = await this.blockManager.getBlock(BigNumber.from(b))
      if (!block) {
        res
          .status(400)
          .send(
            `Invalid request with blockNumber: ${blockNumber.data.toString()}`
          )
          .end()
        return
      }

      // TODO: have to resolve with depositContractAddress
      const sus = await this.stateManager.resolveStateUpdates(
        address,
        range.start,
        range.end
      )
      witnesses = witnesses.concat(
        await Promise.all(
          sus.map(async su => {
            const inclusionProof = block.getInclusionProof(su)
            if (!inclusionProof) return res.status(500).end()
            const hint = createTxHint(BigNumber.from(b), address, range)
            const txs = await Promise.all(
              (await getWitnesses(this.decider.witnessDb, hint)).map(
                async b => {
                  const witness = await getWitnesses(
                    this.decider.witnessDb,
                    createSignatureHint(b)
                  )
                  return {
                    tx: b.toHexString(),
                    witness: witness[0].toHexString()
                  }
                }
              )
            )
            return {
              stateUpdate: coder.encode(su.property.toStruct()),
              inclusionProof: coder.encode(inclusionProof.toStruct()),
              transactions: txs
            }
          })
        )
      )
    }

    res.send({
      data: witnesses
    })
    res.status(200).end()
  }

  /**
   * check if block manager is ready to submit new block.
   * if there are at least one new state update and passed BLOCK_INTERVAL,
   * generate next block and submit to commitment contract
   */
  private async poll() {
    await sleep(this.option.blockInterval)
    const block = await this.blockManager.generateNextBlock()
    if (block) {
      await this.submitBlock(block)
    }
    await this.poll()
  }

  /**
   *  submit next block to commitment contract and store new block
   */
  private async submitBlock(block: Block) {
    const root = block.getTree().getRoot()
    await this.commitmentContract.submit(block.blockNumber, root)
    console.log('submit block: ', block)
  }

  /**
   * verify if sent transaction is valid to update its range
   * if valid, put it in transaction queue which is a queue
   * to be included in next block.
   * @param tx transaction sent by user
   */
  private async ingestTransaction(
    tx: Transaction
  ): Promise<TransactionReceipt> {
    console.log('transaction received: ', tx.range, tx.depositContractAddress)
    const nextBlockNumber = await this.blockManager.getNextBlockNumber()
    const stateUpdates = await this.stateManager.resolveStateUpdates(
      tx.depositContractAddress,
      tx.range.start,
      tx.range.end
    )
    try {
      const nextState = await this.stateManager.executeStateTransition(
        tx,
        nextBlockNumber,
        this.decider
      )

      await this.blockManager.enqueuePendingStateUpdate(nextState)
      return new TransactionReceipt(
        TRANSACTION_STATUS.TRUE,
        nextBlockNumber,
        stateUpdates.map(su => su.blockNumber),
        tx.range,
        tx.depositContractAddress,
        tx.from,
        tx.getHash()
      )
    } catch (e) {
      return new TransactionReceipt(
        TRANSACTION_STATUS.FALSE,
        nextBlockNumber,
        stateUpdates.map(su => su.blockNumber),
        tx.range,
        tx.depositContractAddress,
        tx.from,
        tx.getHash()
      )
    }
  }

  /**
   * factory to generate deposit handler
   * @param depositContract deposit contract address
   */
  private depositHandlerFactory(
    depositContractAddress: Address
  ): (checkpointId: Bytes, checkpoint: [Property]) => Promise<void> {
    return async (checkpointId: Bytes, checkpoint: [Property]) => {
      const blockNumber = await this.blockManager.getCurrentBlockNumber()
      const stateUpdate = checkpoint[0]
      const tx = new DepositTransaction(depositContractAddress, stateUpdate)
      this.stateManager.insertDepositRange(tx, blockNumber)
    }
  }

  /**
   * register new token to be handled by this plasma
   * @param tokenAddress deposit contract address to register
   */
  public registerToken(tokenAddress: Address) {
    console.log('register token: ', tokenAddress.data)
    this.blockManager.registerToken(tokenAddress)
    const depositContract = this.depositContractFactory(tokenAddress)
    this.depositContracts.push(depositContract)
    depositContract.subscribeCheckpointFinalized(
      this.depositHandlerFactory(depositContract.address)
    )
    depositContract.startWatchingEvents()
  }
}
