import * as ethers from 'ethers'
import { Bytes } from '@cryptoeconomicslab/primitives'
import { LevelKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import initializeLightClient from '@cryptoeconomicslab/eth-plasma-light-client'
import LightClient from '@cryptoeconomicslab/plasma-light-client'
import JSBI from 'jsbi'
import parseEther = ethers.utils.parseEther
import parseUnits = ethers.utils.parseUnits

import config from '../config.local.json'

jest.setTimeout(50000)

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function parseUnitsToJsbi(amount: string) {
  return JSBI.BigInt(parseUnits(amount, 18).toString())
}

describe('light client', () => {
  let lightClient: LightClient
  let recieverLightClient: LightClient

  beforeEach(async () => {
    const kvs1 = new LevelKeyValueStore(
      Bytes.fromString('plasma_light_client_1')
    )
    const kvs2 = new LevelKeyValueStore(
      Bytes.fromString('plasma_light_client_2')
    )
    const provider = new ethers.providers.JsonRpcProvider('http://ganache:8545')
    const senderWallet = ethers.Wallet.createRandom().connect(provider)
    const recieverWallet = ethers.Wallet.createRandom().connect(provider)
    const defaultWallet1 = new ethers.Wallet(
      '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
      provider
    )
    const defaultWallet2 = new ethers.Wallet(
      '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
      provider
    )
    await defaultWallet1.sendTransaction({
      to: senderWallet.address,
      value: parseEther('1.0')
    })
    await defaultWallet2.sendTransaction({
      to: recieverWallet.address,
      value: parseEther('1.0')
    })

    lightClient = await initializeLightClient({
      wallet: recieverWallet,
      kvs: kvs1,
      config: config as any,
      aggregatorEndpoint: 'http://aggregator:3000'
    })
    recieverLightClient = await initializeLightClient({
      wallet: senderWallet,
      kvs: kvs2,
      config: config as any,
      aggregatorEndpoint: 'http://aggregator:3000'
    })
    await lightClient.start()
    await recieverLightClient.start()
  })

  describe('deposit', () => {
    test('deposit', async () => {
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )

      await sleep(10000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.1'))
      ).toBeTruthy()
    })

    test('deposit after deposit', async () => {
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.2'))
      ).toBeTruthy()
    })

    test('deposit after transfer', async () => {
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)
      await lightClient.transfer(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract,
        '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
      )
      await sleep(10000)
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.1'))
      ).toBeTruthy()
    })

    test('deposit after exit', async () => {
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)
      await lightClient.exit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.1'))
      ).toBeTruthy()

      const exitList = await lightClient.getExitList()
      expect(exitList.length).toBe(1)
    })
  })

  describe('transfer', () => {
    beforeEach(async () => {
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)
    })

    test('transfer after deposit', async () => {
      await lightClient.deposit(
        parseUnitsToJsbi('0.1'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)
      await lightClient.transfer(
        parseUnitsToJsbi('0.15'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(20000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.05'))
      ).toBeTruthy()
      const recieverBalance = await recieverLightClient.getBalance()
      expect(
        JSBI.equal(recieverBalance[0].amount, parseUnitsToJsbi('0.15'))
      ).toBeTruthy()
    })

    test('transfer after transfer', async () => {
      await lightClient.transfer(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract,
        '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
      )
      await sleep(10000)
      await lightClient.transfer(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract,
        '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
      )
      await sleep(10000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.04'))
      ).toBeTruthy()
    })

    test('transfer after exit', async () => {
      await lightClient.exit(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract
      )
      await sleep(10000)
      await lightClient.transfer(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(20000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.04'))
      ).toBeTruthy()
      const recieverBalance = await recieverLightClient.getBalance()
      expect(
        JSBI.equal(recieverBalance[0].amount, parseUnitsToJsbi('0.03'))
      ).toBeTruthy()
    })

    test('transfer in same block', async () => {
      await lightClient.transfer(
        parseUnitsToJsbi('0.01'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await lightClient.transfer(
        parseUnitsToJsbi('0.01'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await lightClient.transfer(
        parseUnitsToJsbi('0.01'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(20000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.07'))
      ).toBeTruthy()
      const recieverBalance = await recieverLightClient.getBalance()
      expect(
        JSBI.equal(recieverBalance[0].amount, parseUnitsToJsbi('0.03'))
      ).toBeTruthy()
    })

    test('receive', async () => {
      await lightClient.transfer(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(10000)

      const balance = await recieverLightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.03'))
      ).toBeTruthy()
    })

    test('transfer after receiving a range', async () => {
      await lightClient.transfer(
        parseUnitsToJsbi('0.06'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(20000)
      await recieverLightClient.transfer(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract,
        '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
      )
      await sleep(10000)

      const balance = await recieverLightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.03'))
      ).toBeTruthy()
    })

    test('transfer after receiving 2 ranges', async () => {
      await lightClient.transfer(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(10000)
      await lightClient.transfer(
        parseUnitsToJsbi('0.03'),
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(20000)
      await recieverLightClient.transfer(
        parseUnitsToJsbi('0.05'),
        config.payoutContracts.DepositContract,
        '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
      )
      await sleep(10000)

      const balance = await recieverLightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, parseUnitsToJsbi('0.01'))
      ).toBeTruthy()
    })

    test('transfer small amount', async () => {
      await lightClient.transfer(
        1,
        config.payoutContracts.DepositContract,
        recieverLightClient.address
      )
      await sleep(20000)

      const balance = await lightClient.getBalance()
      expect(
        JSBI.equal(balance[0].amount, JSBI.BigInt('99999999999999999'))
      ).toBeTruthy()
      const recieverBalance = await recieverLightClient.getBalance()
      expect(JSBI.equal(recieverBalance[0].amount, JSBI.BigInt(1))).toBeTruthy()
    })
  })
})
