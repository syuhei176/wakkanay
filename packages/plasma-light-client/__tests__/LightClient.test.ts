import LightClient from '../src/LightClient'
import StateManager from '../src/managers/StateManager'
import SyncManager from '../src/managers/SyncManager'
import { setupContext } from '@cryptoeconomicslab/context'
import { IndexedDbKeyValueStore } from '@cryptoeconomicslab/indexeddb-kvs'
import 'fake-indexeddb/auto'

import { EthWallet } from '@cryptoeconomicslab/eth-wallet'
import { EthCoder } from '@cryptoeconomicslab/eth-coder'

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
const MockERC20Contract = (ERC20Contract as unknown) as jest.Mock<ERC20Contract>
const MockCommitmentContract = (CommitmentContract as unknown) as jest.Mock<
  CommitmentContract
>

import { Address, Bytes, Integer } from '@cryptoeconomicslab/primitives'
import { ethers } from 'ethers'
import { CheckpointManager } from '../src/managers'
import config from './config.local'
import { InitilizationConfig } from '@cryptoeconomicslab/ovm'
setupContext({ coder: EthCoder })

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

describe('LightClient', () => {
  let client: LightClient
  beforeEach(async () => {
    MockAdjudicationContract.mockClear()
    MockDepositContract.mockClear()
    MockCommitmentContract.mockClear()
    MockERC20Contract.mockClear()

    client = await initialize()
    client.registerToken(Address.default(), Address.default())
  })

  test('deposit calls contract methods', async () => {
    // setup mock values
    MockDepositContract.prototype.address = Address.default()

    await client.deposit(20, Address.default())

    const tokenContract = MockERC20Contract.mock.instances[0]
    expect(tokenContract.approve).toHaveBeenLastCalledWith(
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
      client.deposit(20, Address.from('0x00000000000000000001'))
    ).rejects.toEqual(new Error('Contract not found'))
  })
})
