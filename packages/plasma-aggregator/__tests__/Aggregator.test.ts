import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '.test.env') })

import Aggregator from '../src/Aggregator'
import {
  DepositTransaction,
  Transaction,
  StateUpdate,
  TRANSACTION_STATUS
} from '@cryptoeconomicslab/plasma'
import { InMemoryKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import { RangeStore, RangeDb, KeyValueStore } from '@cryptoeconomicslab/db'
import { InitilizationConfig, CompiledPredicate } from '@cryptoeconomicslab/ovm'
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
import JSBI from 'jsbi'
import config from './config.local'
setupContext({
  coder: Coder
})

import { BlockManager, StateManager } from '../src/managers'
import * as ethers from 'ethers'

const ALIS_WALLET = new EthWallet(ethers.Wallet.createRandom())
const ALIS_ADDRESS = ALIS_WALLET.getAddress()
const BOB_WALLET = new EthWallet(ethers.Wallet.createRandom())
const BOB_ADDRESS = BOB_WALLET.getAddress()

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
      config as InitilizationConfig
    )
    aggregator.registerToken(
      Address.from(config.payoutContracts.DepositContract)
    )
  })

  test('deposit', async () => {
    // create ownership stateupdate
    const { decider } = aggregator
    const { coder } = ovmContext
    const depositContractAddress = Address.from(
      config.payoutContracts.DepositContract
    )
    const ownershipPredicate = decider.compiledPredicateMap.get(
      'Ownership'
    ) as CompiledPredicate
    const stateUpdate = new StateUpdate(
      decider.getDeciderAddress('StateUpdate'),
      depositContractAddress,
      new Range(BigNumber.from(0), BigNumber.from(10)),
      BigNumber.from(0),
      ownershipPredicate.makeProperty([coder.encode(ALIS_ADDRESS)])
    )
    const depositTx = new DepositTransaction(
      depositContractAddress,
      stateUpdate.property
    )
    await aggregator['stateManager'].insertDepositRange(
      depositTx,
      BigNumber.from(0)
    )

    const result = await stateDb.get(JSBI.BigInt(0), JSBI.BigInt(100))
    expect(result.length).toBe(1)
  })

  test('state transition', async () => {
    // create ownership stateupdate
    const { decider } = aggregator
    const { coder } = ovmContext
    const depositContractAddress = Address.from(
      config.payoutContracts.DepositContract
    )
    const ownershipPredicate = decider.compiledPredicateMap.get(
      'Ownership'
    ) as CompiledPredicate
    const stateUpdate = new StateUpdate(
      decider.getDeciderAddress('StateUpdate'),
      depositContractAddress,
      new Range(BigNumber.from(0), BigNumber.from(10)),
      BigNumber.from(0),
      ownershipPredicate.makeProperty([coder.encode(ALIS_ADDRESS)])
    )
    const depositTx = new DepositTransaction(
      depositContractAddress,
      stateUpdate.property
    )
    await aggregator['stateManager'].insertDepositRange(
      depositTx,
      BigNumber.from(0)
    )

    const nextStateObject = ownershipPredicate.makeProperty([
      coder.encode(BOB_ADDRESS)
    ])

    const tx = new Transaction(
      depositContractAddress,
      new Range(BigNumber.from(0), BigNumber.from(5)),
      BigNumber.from(5),
      nextStateObject,
      ALIS_ADDRESS
    )
    tx.signature = await ALIS_WALLET.signMessage(
      coder.encode(tx.toProperty(Address.default()).toStruct())
    )

    const receipt = await aggregator['ingestTransaction'](tx)
    expect(receipt.status).toBe(TRANSACTION_STATUS.TRUE)

    const result = await stateDb.get(JSBI.BigInt(0), JSBI.BigInt(100))
    expect(result.length).toBe(2)
  })
})
