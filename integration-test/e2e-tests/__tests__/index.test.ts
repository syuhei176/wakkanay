import * as ethers from 'ethers'
import { Bytes } from '@cryptoeconomicslab/primitives'
import { LevelKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import initializeLightClient from '@cryptoeconomicslab/eth-plasma-light-client'
import LightClient from '@cryptoeconomicslab/plasma-light-client'
import JSBI from 'jsbi'

import config from '../config.local.json'

jest.setTimeout(30000)

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
      new ethers.providers.JsonRpcProvider('http://ganache:8545')
    )

    lightClient = await initializeLightClient({
      wallet,
      kvs,
      config: config as any,
      aggregatorEndpoint: 'http://aggregator:3000'
    })
  })

  test('deposit', async () => {
    await lightClient.start()
    await lightClient.deposit(10, config.payoutContracts.DepositContract)

    await sleep(10000)

    const balance = await lightClient.getBalance()
    expect(JSBI.equal(balance[0].amount, JSBI.BigInt(10))).toBeTruthy()
  })
})
