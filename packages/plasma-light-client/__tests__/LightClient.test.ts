import LightClient from '../src/LightClient'
import StateManager from '../src/managers/StateManager'
import SyncManager from '../src/managers/SyncManager'
import { setupContext } from '@cryptoeconomicslab/context'
import JsonCoder from '@cryptoeconomicslab/coder'
import { replaceHint } from '@cryptoeconomicslab/db'
import { IndexedDbKeyValueStore } from '@cryptoeconomicslab/indexeddb-kvs'
import 'fake-indexeddb/auto'

import { EthWallet } from '@cryptoeconomicslab/eth-wallet'

import { AdjudicationContract } from '@cryptoeconomicslab/eth-contract/lib/contract/AdjudicationContract'
import { DepositContract } from '@cryptoeconomicslab/eth-contract/lib/contract/DepositContract'
import { ERC20Contract } from '@cryptoeconomicslab/eth-contract/lib/contract/ERC20Contract'
import { CommitmentContract } from '@cryptoeconomicslab/eth-contract/lib/contract/CommitmentContract'

jest.mock('@cryptoeconomicslab/eth-contract/lib/contract/AdjudicationContract')
jest.mock('@cryptoeconomicslab/eth-contract/lib/contract/DepositContract')
jest.mock('@cryptoeconomicslab/eth-contract/lib/contract/ERC20Contract')
jest.mock('@cryptoeconomicslab/eth-contract/lib/contract/CommitmentContract')

const MockAdjudicationContract = (AdjudicationContract as unknown) as jest.Mock<
  AdjudicationContract
>

const MockDepositContract = (DepositContract as unknown) as jest.Mock<
  DepositContract
>

const mockApprove = jest.fn()
const MockERC20Contract = jest.fn().mockImplementation((address: Address) => {
  return {
    approve: mockApprove,
    address
  }
}) as jest.Mock<ERC20Contract>

const MockCommitmentContract = (CommitmentContract as unknown) as jest.Mock<
  CommitmentContract
>

import {
  Address,
  Bytes,
  BigNumber,
  Integer,
  Range
} from '@cryptoeconomicslab/primitives'
import { ethers } from 'ethers'
import { CheckpointManager } from '../src/managers'
import config from './config.local'
import { InitilizationConfig, CompiledPredicate } from '@cryptoeconomicslab/ovm'
import { StateUpdate, Exit } from '@cryptoeconomicslab/plasma'
import { putWitness } from '@cryptoeconomicslab/db'
import {
  DoubleLayerInclusionProof,
  IntervalTreeInclusionProof,
  AddressTreeInclusionProof
} from '@cryptoeconomicslab/merkle-tree'
setupContext({ coder: JsonCoder })

async function initialize(): Promise<LightClient> {
  const kvs = new IndexedDbKeyValueStore(Bytes.fromString('root'))
  const syncDb = await kvs.bucket(Bytes.fromString('sync'))
  const stateDb = await kvs.bucket(Bytes.fromString('state'))
  const witnessDb = await kvs.bucket(Bytes.fromString('witness'))
  const checkpointDb = await kvs.bucket(Bytes.fromString('checkpoint'))
  const syncManager = new SyncManager(syncDb)
  const stateManager = new StateManager(stateDb)
  const checkpointManager = new CheckpointManager(checkpointDb)
  const wallet = new EthWallet(ethers.Wallet.createRandom())
  const eventDb = await kvs.bucket(Bytes.fromString('event'))

  const adjudicationContract = new MockAdjudicationContract(
    Address.from('0x8f0483125FCb9aaAEFA9209D8E9d7b9C8B9Fb90F'),
    eventDb,
    wallet.getEthersWallet()
  )
  const depositContractFactory = (addr: Address) => {
    return new MockDepositContract(addr, eventDb, wallet.getEthersWallet())
  }
  const tokenContractFactory = (addr: Address) => {
    return new MockERC20Contract(addr, wallet.getEthersWallet())
  }
  const commitmentContract = new MockCommitmentContract(
    Address.from('0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0'),
    eventDb,
    wallet.getEthersWallet()
  )

  return new LightClient(
    wallet,
    witnessDb,
    adjudicationContract,
    depositContractFactory,
    tokenContractFactory,
    commitmentContract,
    stateManager,
    syncManager,
    checkpointManager,
    config as InitilizationConfig
  )
}

MockDepositContract.prototype.address = Address.default()
const defaultAddress = Address.default().data

describe('LightClient', () => {
  let client: LightClient
  beforeEach(async () => {
    MockAdjudicationContract.mockClear()
    MockDepositContract.mockClear()
    MockCommitmentContract.mockClear()
    MockERC20Contract.mockClear()

    client = await initialize()
    client.registerToken(defaultAddress, defaultAddress)
  })
  describe('deposit', () => {
    test('deposit calls contract methods', async () => {
      // setup mock values

      await client.deposit(20, defaultAddress)

      expect(mockApprove).toHaveBeenLastCalledWith(
        Address.default(),
        Integer.from(20)
      )

      const depositContract = MockDepositContract.mock.instances[0]
      expect(depositContract.deposit).toHaveBeenLastCalledWith(
        Integer.from(20),
        client.ownershipProperty(Address.from(client.address))
      )
    })

    test('deposit calls to unregistered contract should fail', async () => {
      await expect(
        client.deposit(20, Address.from('0x00000000000000000001').data)
      ).rejects.toEqual(new Error('Contract not found'))
    })
  })

  describe('exit', () => {
    let su1: StateUpdate
    let su2: StateUpdate
    let proof: DoubleLayerInclusionProof

    beforeAll(() => {
      su1 = new StateUpdate(
        Address.from(
          config.deployedPredicateTable.StateUpdatePredicate.deployedAddress
        ),
        Address.default(),
        new Range(BigNumber.from(0), BigNumber.from(20)),
        BigNumber.from(0),
        client.ownershipProperty(Address.from(client.address))
      )
      su2 = new StateUpdate(
        Address.from(
          config.deployedPredicateTable.StateUpdatePredicate.deployedAddress
        ),
        Address.default(),
        new Range(BigNumber.from(30), BigNumber.from(40)),
        BigNumber.from(1),
        client.ownershipProperty(Address.from(client.address))
      )

      proof = new DoubleLayerInclusionProof(
        new IntervalTreeInclusionProof(BigNumber.from(0), 0, []),
        new AddressTreeInclusionProof(Address.default(), 0, [])
      )
    })

    beforeEach(async () => {
      // let's say ownership stateupdate of range 0-20 and inclusion proof for that is stored in client.
      const { coder } = ovmContext

      // setup
      // store ownership stateupdate
      await client['stateManager'].insertVerifiedStateUpdate(
        Address.default(),
        su1
      )
      await client['stateManager'].insertVerifiedStateUpdate(
        Address.default(),
        su2
      )
      // store inclusion proof
      const hint1 = replaceHint(
        'proof.block${b}.range${token},RANGE,${range}',
        {
          b: coder.encode(su1.blockNumber),
          token: coder.encode(su1.depositContractAddress),
          range: coder.encode(su1.range.toStruct())
        }
      )
      await putWitness(
        client['witnessDb'],
        hint1,
        coder.encode(proof.toStruct())
      )
      const hint2 = replaceHint(
        'proof.block${b}.range${token},RANGE,${range}',
        {
          b: coder.encode(su2.blockNumber),
          token: coder.encode(su2.depositContractAddress),
          range: coder.encode(su2.range.toStruct())
        }
      )

      await putWitness(
        client['witnessDb'],
        hint2,
        coder.encode(proof.toStruct())
      )
    })

    test('exit calls claimProperty of adjudicationContract', async () => {
      const { coder } = ovmContext
      await client.exit(20, defaultAddress)

      const adjudicationContract = MockAdjudicationContract.mock.instances[0]
      const exitProperty = (client['deciderManager'].compiledPredicateMap.get(
        'Exit'
      ) as CompiledPredicate).makeProperty([
        coder.encode(su1.property.toStruct()),
        coder.encode(proof.toStruct())
      ])
      expect(adjudicationContract.claimProperty).toHaveBeenLastCalledWith(
        exitProperty
      )

      const exitingStateUpdate = await client[
        'stateManager'
      ].getExitStateUpdates(
        Address.default(),
        new Range(BigNumber.from(0), BigNumber.from(20))
      )
      expect(exitingStateUpdate).toEqual([su1])
    })

    test('exit with multiple range', async () => {
      const { coder } = ovmContext
      await client.exit(25, defaultAddress)

      const adjudicationContract = MockAdjudicationContract.mock.instances[0]
      const exitProperty = (client['deciderManager'].compiledPredicateMap.get(
        'Exit'
      ) as CompiledPredicate).makeProperty([
        coder.encode(su1.property.toStruct()),
        coder.encode(proof.toStruct())
      ])
      su2.update({
        range: new Range(BigNumber.from(30), BigNumber.from(35))
      })
      const exitProperty2 = (client['deciderManager'].compiledPredicateMap.get(
        'Exit'
      ) as CompiledPredicate).makeProperty([
        coder.encode(su2.property.toStruct()),
        coder.encode(proof.toStruct())
      ])

      expect(adjudicationContract.claimProperty).toHaveBeenCalledWith(
        exitProperty
      )
      expect(adjudicationContract.claimProperty).toHaveBeenCalledWith(
        exitProperty2
      )

      const exitingStateUpdates = await client[
        'stateManager'
      ].getExitStateUpdates(
        Address.default(),
        new Range(BigNumber.from(0), BigNumber.from(40))
      )
      expect(exitingStateUpdates).toEqual([su1, su2])
    })

    test('exit calls fail with unsufficient amount', async () => {
      await expect(client.exit(31, defaultAddress)).rejects.toEqual(
        new Error('Insufficient amount')
      )
    })

    test('exitList', async () => {
      await client.exit(25, defaultAddress)
      const exitList = await client.getExitlist()

      const { coder } = ovmContext
      const exitProperty = (client['deciderManager'].compiledPredicateMap.get(
        'Exit'
      ) as CompiledPredicate).makeProperty([
        coder.encode(su1.property.toStruct()),
        coder.encode(proof.toStruct())
      ])
      su2.update({
        range: new Range(BigNumber.from(30), BigNumber.from(35))
      })
      const exitProperty2 = (client['deciderManager'].compiledPredicateMap.get(
        'Exit'
      ) as CompiledPredicate).makeProperty([
        coder.encode(su2.property.toStruct()),
        coder.encode(proof.toStruct())
      ])

      expect(exitList).toEqual([
        Exit.fromProperty(exitProperty),
        Exit.fromProperty(exitProperty2)
      ])
    })

    test('finalizeExit', async () => {
      const { coder } = ovmContext
      const exitProperty = (client['deciderManager'].compiledPredicateMap.get(
        'Exit'
      ) as CompiledPredicate).makeProperty([
        coder.encode(su1.property.toStruct()),
        coder.encode(proof.toStruct())
      ])
      const exit = Exit.fromProperty(exitProperty)
      await client.finalizeExit(exit)

      const depositContract = MockDepositContract.mock.instances[0]
      expect(depositContract.finalizeExit).toHaveBeenLastCalledWith(
        exit.toProperty(client['deciderManager'].getDeciderAddress('Exit')),
        Integer.from(Number(exit.range.end.raw))
      )
    })
  })
  test('getOwner', () => {
    const owner = client.getOwner(
      new StateUpdate(
        Address.from(
          config.deployedPredicateTable.StateUpdatePredicate.deployedAddress
        ),
        Address.default(),
        new Range(BigNumber.from(0), BigNumber.from(20)),
        BigNumber.from(0),
        client.ownershipProperty(Address.from(client.address))
      )
    )
    expect(owner).toEqual(Address.from(client.address))
  })
})
