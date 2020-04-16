import { ethers } from 'ethers'
import initialize from '../src/index'
import { Bytes, Integer } from '@cryptoeconomicslab/primitives'
import deciderConfig from './config.local'
import { LevelKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import {
  CommitmentContract,
  AdjudicationContract,
  OwnershipPayoutContract
} from '@cryptoeconomicslab/eth-contract'
import { setupContext } from '@cryptoeconomicslab/context'
import JsonCoder from '@cryptoeconomicslab/coder'
setupContext({ coder: JsonCoder })

// mock
jest.mock('@cryptoeconomicslab/eth-contract', () => {
  const {
    ERC20Contract,
    CommitmentContract,
    AdjudicationContract,
    OwnershipPayoutContract
  } = jest.requireActual('@cryptoeconomicslab/eth-contract')
  return {
    DepositContract: jest.fn().mockImplementation(address => {
      return {
        address: address.data,
        subscribeCheckpointFinalized: jest
          .fn()
          .mockImplementation(async () => {}),
        subscribeDepositedRangeExtended: jest
          .fn()
          .mockImplementation(async () => {}),
        subscribeDepositedRangeRemoved: jest
          .fn()
          .mockImplementation(async () => {}),
        startSubscribing: jest.fn()
      }
    }),
    ERC20Contract,
    CommitmentContract,
    AdjudicationContract,
    OwnershipPayoutContract,
    PETHContract: jest.fn().mockImplementation(() => {
      return {
        address: '',
        approve: jest.fn().mockImplementation(async () => {
          return
        }),
        decimals: jest.fn().mockImplementation(async () => {
          return Integer.from(18)
        })
      }
    })
  }
})

describe('index', () => {
  beforeEach(async () => {})
  describe('initialize', () => {
    test('suceed to initialize', async () => {
      const kvs = new LevelKeyValueStore(Bytes.fromString('root'))
      let wallet = ethers.Wallet.createRandom()
      wallet = wallet.connect(ethers.getDefaultProvider())
      const client = await initialize({ wallet, kvs, config: deciderConfig })
      expect(client['adjudicationContract']).toBeInstanceOf(
        AdjudicationContract
      )
      expect(client['commitmentContract']).toBeInstanceOf(CommitmentContract)
      expect(client['ownershipPayoutContract']).toBeInstanceOf(
        OwnershipPayoutContract
      )
    })
  })
})
