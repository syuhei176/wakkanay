import * as ethers from 'ethers'
import { Bytes } from '@cryptoeconomicslab/primitives'
import { LevelKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import initializeLightClient from '@cryptoeconomicslab/eth-plasma-light-client'
import LightClient from '@cryptoeconomicslab/plasma-light-client'

import config from '../config.local.json'

jest.setTimeout(50000)

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('light client', () => {
  let lightClient: LightClient
  beforeAll(async () => {
    const kvs = new LevelKeyValueStore(Bytes.fromString('plasma_light_client'))
    const wallet = new ethers.Wallet(
      '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
      new ethers.providers.JsonRpcProvider('http://localhost:8545')
    )

    lightClient = await initializeLightClient({
      wallet,
      kvs,
      config: config as any,
      aggregatorEndpoint: 'http://localhost:3000'
    })
  })

  test('deposit', async () => {
    await lightClient.start()
    await lightClient.deposit(10, config.payoutContracts.DepositContract)

    await sleep(15000)

    const balance = await lightClient.getBalance()
    expect(balance[0].amount).toBe(10)
  })

  /*

  test('exit deposit', async () => {
    await lightClient.deposit(10, config.payoutContracts.DepositContract)

    await sleep(10000)

    const balance = await lightClient.getBalance()

    await lightClient.exit(10, config.payoutContracts.DepositContract)
    const exitList = await lightClient.getExitlist()
    expect(exitList).toBe([])
  })
  */
})
