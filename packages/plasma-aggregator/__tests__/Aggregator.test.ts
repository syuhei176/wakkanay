import Aggregator from '../src/Aggregator'

import { DepositTransaction, Transaction } from '@cryptoeconomicslab/plasma'
import { InMemoryKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import { RangeStore, RangeDb, KeyValueStore } from '@cryptoeconomicslab/db'
import { Property } from '@cryptoeconomicslab/ovm'
import {
  Address,
  Bytes,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import { setupContext } from '@cryptoeconomicslab/context'
import { EthWallet } from '@cryptoeconomicslab/eth-wallet'
import {
  CommitmentContract,
  DepositContract
} from '@cryptoeconomicslab/eth-contract'
setupContext({
  coder: Coder
})

import { BlockManager, StateManager } from '../src/managers'
import * as ethers from 'ethers'
import fs from 'fs'

describe('Aggregator integration', () => {
  let aggregator: Aggregator,
    stateDb: RangeStore,
    stateManager: StateManager,
    blockDb: KeyValueStore,
    blockManager: BlockManager,
    kvs: KeyValueStore,
    stateBucket: KeyValueStore,
    wallet: EthWallet,
    witnessDb: KeyValueStore,
    eventDb: KeyValueStore

  const su = (s: number, e: number) =>
    new DepositTransaction(
      Address.default(),
      new Property(
        Address.default(),
        [
          Address.default(),
          new Range(BigNumber.from(s), BigNumber.from(e)).toStruct(),
          BigNumber.from(1),
          new Property(Address.default(), [
            Bytes.fromHexString('0x01')
          ]).toStruct()
        ].map(Coder.encode)
      )
    )

  beforeEach(async () => {
    kvs = new InMemoryKeyValueStore(Bytes.fromString('test-db'))
    stateBucket = await kvs.bucket(Bytes.fromString('state_update'))
    stateDb = new RangeDb(stateBucket)
    blockDb = await kvs.bucket(Bytes.fromString('block'))
    stateManager = new StateManager(stateDb)
    blockManager = new BlockManager(blockDb)
    witnessDb = await kvs.bucket(Bytes.fromString('witness'))
    eventDb = await kvs.bucket(Bytes.fromString('event'))
    wallet = new EthWallet(ethers.Wallet.createRandom())

    function depositContractFactory(address: Address) {
      return new DepositContract(address, eventDb, wallet.getEthersWallet())
    }
    function commitmentContractFactory(address: Address) {
      return new CommitmentContract(address, eventDb, wallet.getEthersWallet())
    }
    aggregator = new Aggregator(
      wallet,
      stateManager,
      blockManager,
      witnessDb,
      depositContractFactory,
      commitmentContractFactory,
      JSON.parse(fs.readFileSync('config.local.json').toString())
    )
  })

  test.skip('insert state update on deposit', async () => {
    // call method by accessor to test private method
    // await aggregator['handleDeposit'](su(0, 10))
    // await aggregator['handleDeposit'](su(15, 20))
    // await aggregator['handleDeposit'](su(20, 30))

    const result = await stateDb.get(BigInt(0), BigInt(100))
    expect(result.length).toBe(3)
  })

  // TODO: fix ownership property
  test.skip('test state transition', async () => {
    // call method by accessor to test private method
    // await aggregator['handleDeposit'](su(0, 10))

    const transaction = new Transaction(
      Address.default(),
      new Range(BigNumber.from(0), BigNumber.from(5)),
      BigNumber.default(),
      Property.fromStruct(Property.getParamType()), // TODO: this should be ownership property
      Address.default()
    )
    await aggregator['ingestTransaction'](transaction)

    const result = await stateDb.get(BigInt(0), BigInt(100))
    expect(result.length).toBe(2)
  })
})
