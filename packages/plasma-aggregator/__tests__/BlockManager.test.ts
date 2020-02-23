import BlockManager from '../src/managers/BlockManager'
import { Block, StateUpdate } from '@cryptoeconomicslab/plasma'
import { InMemoryKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import { Property } from '@cryptoeconomicslab/ovm'
import {
  Address,
  Bytes,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({
  coder: Coder
})

const stateUpdateProperty = new Property(
  Address.default(),
  [
    Address.default(),
    new Range(BigNumber.from(0), BigNumber.from(10)).toStruct(),
    BigNumber.from(1),
    new Property(Address.default(), [Bytes.fromHexString('0x01')]).toStruct()
  ].map(Coder.encode)
)

describe('BlockManager', () => {
  let blockManager: BlockManager, kvs: InMemoryKeyValueStore

  beforeEach(async () => {
    kvs = new InMemoryKeyValueStore(Bytes.fromString('block_manager'))
    blockManager = new BlockManager(kvs)
    blockManager.registerToken(Address.default())
  })

  test('get and put block', async () => {
    const map = new Map()
    map.set('0x0001100000000000000000000000000100110011', [
      StateUpdate.fromProperty(stateUpdateProperty),
      StateUpdate.fromProperty(stateUpdateProperty)
    ])
    map.set('0x0001100110011001100110011001101100110011', [
      StateUpdate.fromProperty(stateUpdateProperty)
    ])
    const block1 = new Block(BigNumber.from(1), map)
    await blockManager.putBlock(block1)
    const res = await blockManager.getBlock(BigNumber.from(1))
    expect(res).toEqual(block1)
  })

  test('get to be null if no block is stored for given block number', async () => {
    const res = await blockManager.getBlock(BigNumber.from(1))
    expect(res).toBeNull()
  })

  test('generateBlock clear isReady', async () => {
    expect(blockManager.isReady).toBeFalsy()
    await blockManager.enqueuePendingStateUpdate(
      StateUpdate.fromProperty(stateUpdateProperty)
    )
    expect(blockManager.isReady).toBeTruthy()
    await blockManager.generateNextBlock()
    expect(blockManager.isReady).toBeFalsy()
  })

  test('generateBlock increment block number', async () => {
    await blockManager.enqueuePendingStateUpdate(
      StateUpdate.fromProperty(stateUpdateProperty)
    )
    expect(blockManager.currentBlockNumber).toEqual(BigNumber.from(0))
    await blockManager.generateNextBlock()
    expect(blockManager.currentBlockNumber).toEqual(BigNumber.from(1))
  })

  test('generateBlock', async () => {
    await blockManager.enqueuePendingStateUpdate(
      StateUpdate.fromProperty(stateUpdateProperty)
    )
    const block = await blockManager.generateNextBlock()
    const map = new Map<string, StateUpdate[]>()
    map.set(Address.default().data, [
      StateUpdate.fromProperty(stateUpdateProperty)
    ])
    const expected = new Block(BigNumber.from(1), map)
    expect(block).toEqual(expected)
  })
})
