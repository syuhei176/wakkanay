import { StateManager } from '../src/managers'
import { RangeDb } from '@cryptoeconomicslab/db'
import { InMemoryKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import {
  Bytes,
  Address,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import {
  DepositTransaction,
  StateUpdate,
  Transaction
} from '@cryptoeconomicslab/plasma'
import {
  DeciderManager,
  CompiledPredicate,
  InitilizationConfig
} from '@cryptoeconomicslab/ovm'
import { EthCoder } from '@cryptoeconomicslab/eth-coder'
import { EthWallet } from '@cryptoeconomicslab/eth-wallet'
import { setupContext } from '@cryptoeconomicslab/context'
import config from './config.local'
import { ethers } from 'ethers'
setupContext({ coder: EthCoder })

const DEPOSIT_ADDRESS = Address.default()
const ALIS_WALLET = new EthWallet(ethers.Wallet.createRandom())
const BOB_WALLET = new EthWallet(ethers.Wallet.createRandom())
const ALIS_ADDRESS = ALIS_WALLET.getAddress()
const BOB_ADDRESS = BOB_WALLET.getAddress()

describe('StateManager', () => {
  let stateManager: StateManager
  let deciderManager: DeciderManager
  let ownershipPredicate: CompiledPredicate

  function ownershipStateUpdate(
    address: Address,
    range: Range,
    blockNumber: BigNumber
  ) {
    return new StateUpdate(
      (deciderManager.compiledPredicateMap.get(
        'StateUpdate'
      ) as CompiledPredicate).deployedAddress,
      DEPOSIT_ADDRESS,
      range,
      blockNumber,
      ownershipPredicate.makeProperty([EthCoder.encode(address)])
    )
  }

  function depositTx(address: Address, range: Range, blockNumber: BigNumber) {
    const stateUpdate = ownershipStateUpdate(address, range, blockNumber)
    return new DepositTransaction(DEPOSIT_ADDRESS, stateUpdate.property)
  }

  beforeEach(async () => {
    const kvs = new InMemoryKeyValueStore(Bytes.fromString('test'))
    const witnessDb = await kvs.bucket(Bytes.fromString('witness'))
    deciderManager = new DeciderManager(witnessDb, EthCoder)
    deciderManager.loadJson(config as InitilizationConfig)
    ownershipPredicate = deciderManager.compiledPredicateMap.get(
      'Ownership'
    ) as CompiledPredicate
    const rangeDb = new RangeDb(kvs)
    stateManager = new StateManager(rangeDb)
  })

  describe('insert deposit range, resolve state updates', () => {
    test('insert deposit range', async () => {
      const tx = depositTx(
        ALIS_ADDRESS,
        new Range(BigNumber.from(0), BigNumber.from(1)),
        BigNumber.from(0)
      )
      await expect(
        stateManager.insertDepositRange(tx, BigNumber.from(0))
      ).resolves.toBeUndefined()
    })

    test('resolve deposited range', async () => {
      const tx = depositTx(
        ALIS_ADDRESS,
        new Range(BigNumber.from(0), BigNumber.from(1)),
        BigNumber.from(0)
      )
      await stateManager.insertDepositRange(tx, BigNumber.from(0))
      const stateUpdates = await stateManager.resolveStateUpdates(
        BigNumber.from(0),
        BigNumber.from(1)
      )
      expect(stateUpdates).toEqual([
        ownershipStateUpdate(
          ALIS_ADDRESS,
          new Range(BigNumber.from(0), BigNumber.from(1)),
          BigNumber.from(0)
        )
      ])
    })
  })

  describe('execute state transition', () => {
    beforeEach(async () => {
      await stateManager.insertDepositRange(
        depositTx(
          ALIS_ADDRESS,
          new Range(BigNumber.from(0), BigNumber.from(5)),
          BigNumber.from(0)
        ),
        BigNumber.from(0)
      )
      await stateManager.insertDepositRange(
        depositTx(
          ALIS_ADDRESS,
          new Range(BigNumber.from(5), BigNumber.from(10)),
          BigNumber.from(0)
        ),
        BigNumber.from(0)
      )
      await stateManager.insertDepositRange(
        depositTx(
          ALIS_ADDRESS,
          new Range(BigNumber.from(12), BigNumber.from(15)),
          BigNumber.from(0)
        ),
        BigNumber.from(0)
      )
    })

    test('succeed to update whole deposited range', async () => {
      const tx = new Transaction(
        DEPOSIT_ADDRESS,
        new Range(BigNumber.from(0), BigNumber.from(5)),
        BigNumber.from(3),
        ownershipPredicate.makeProperty([EthCoder.encode(BOB_ADDRESS)]),
        ALIS_ADDRESS
      )
      const sig = await ALIS_WALLET.signMessage(
        EthCoder.encode(tx.toProperty(Address.default()).toStruct())
      )
      tx.signature = sig
      expect(
        await stateManager.executeStateTransition(
          tx,
          BigNumber.from(1),
          deciderManager
        )
      ).toEqual(
        ownershipStateUpdate(
          BOB_ADDRESS,
          new Range(BigNumber.from(0), BigNumber.from(5)),
          BigNumber.from(1)
        )
      )
    })

    test('succeed to update subrange of deposited range', async () => {
      const tx = new Transaction(
        DEPOSIT_ADDRESS,
        new Range(BigNumber.from(0), BigNumber.from(3)),
        BigNumber.from(2),
        ownershipPredicate.makeProperty([EthCoder.encode(BOB_ADDRESS)]),
        ALIS_ADDRESS
      )
      const sig = await ALIS_WALLET.signMessage(
        EthCoder.encode(tx.toProperty(Address.default()).toStruct())
      )
      tx.signature = sig
      expect(
        await stateManager.executeStateTransition(
          tx,
          BigNumber.from(1),
          deciderManager
        )
      ).toEqual(
        ownershipStateUpdate(
          BOB_ADDRESS,
          new Range(BigNumber.from(0), BigNumber.from(3)),
          BigNumber.from(1)
        )
      )
    })

    test('succeed to update contigious multiple ranges', async () => {
      const tx = new Transaction(
        DEPOSIT_ADDRESS,
        new Range(BigNumber.from(0), BigNumber.from(10)),
        BigNumber.from(2),
        ownershipPredicate.makeProperty([EthCoder.encode(BOB_ADDRESS)]),
        ALIS_ADDRESS
      )
      const sig = await ALIS_WALLET.signMessage(
        EthCoder.encode(tx.toProperty(Address.default()).toStruct())
      )
      tx.signature = sig
      expect(
        await stateManager.executeStateTransition(
          tx,
          BigNumber.from(1),
          deciderManager
        )
      ).toEqual(
        ownershipStateUpdate(
          BOB_ADDRESS,
          new Range(BigNumber.from(0), BigNumber.from(10)),
          BigNumber.from(1)
        )
      )
    })

    test('succeed to update intersected multiple ranges', async () => {
      const tx = new Transaction(
        DEPOSIT_ADDRESS,
        new Range(BigNumber.from(2), BigNumber.from(7)),
        BigNumber.from(2),
        ownershipPredicate.makeProperty([EthCoder.encode(BOB_ADDRESS)]),
        ALIS_ADDRESS
      )
      const sig = await ALIS_WALLET.signMessage(
        EthCoder.encode(tx.toProperty(Address.default()).toStruct())
      )
      tx.signature = sig
      expect(
        await stateManager.executeStateTransition(
          tx,
          BigNumber.from(1),
          deciderManager
        )
      ).toEqual(
        ownershipStateUpdate(
          BOB_ADDRESS,
          new Range(BigNumber.from(2), BigNumber.from(7)),
          BigNumber.from(1)
        )
      )
    })

    test('fail to update with invalid transaction', async () => {
      const tx = new Transaction(
        DEPOSIT_ADDRESS,
        new Range(BigNumber.from(0), BigNumber.from(3)),
        BigNumber.from(2),
        ownershipPredicate.makeProperty([EthCoder.encode(BOB_ADDRESS)]),
        ALIS_ADDRESS
      )
      tx.signature = Bytes.default()
      await expect(
        stateManager.executeStateTransition(
          tx,
          BigNumber.from(1),
          deciderManager
        )
      ).rejects.toEqual(new Error('InvalidTransaction'))
    })

    test('fail to update with no intersected prevStates', async () => {
      const tx = new Transaction(
        DEPOSIT_ADDRESS,
        new Range(BigNumber.from(20), BigNumber.from(25)),
        BigNumber.from(2),
        ownershipPredicate.makeProperty([EthCoder.encode(BOB_ADDRESS)]),
        ALIS_ADDRESS
      )
      tx.signature = Bytes.default()
      await expect(
        stateManager.executeStateTransition(
          tx,
          BigNumber.from(1),
          deciderManager
        )
      ).rejects.toEqual(new Error('InvalidTransaction'))
    })

    test('fail to update not contigious multiple ranges', async () => {
      const ranges = await stateManager.resolveStateUpdates(
        BigNumber.from(0),
        BigNumber.from(15)
      )
      console.log(ranges)

      const tx = new Transaction(
        DEPOSIT_ADDRESS,
        new Range(BigNumber.from(0), BigNumber.from(15)),
        BigNumber.from(2),
        ownershipPredicate.makeProperty([EthCoder.encode(BOB_ADDRESS)]),
        ALIS_ADDRESS
      )
      const sig = await ALIS_WALLET.signMessage(
        EthCoder.encode(tx.toProperty(Address.default()).toStruct())
      )
      tx.signature = sig

      await expect(
        stateManager.executeStateTransition(
          tx,
          BigNumber.from(1),
          deciderManager
        )
      ).rejects.toEqual(new Error('InvalidTransaction'))
    })
  })
})
