import { EthWalletFactory, IWallet, IWalletFactory } from '../../src/wallet'
import { ethers } from 'ethers'
import { Address } from '../../src/types'

describe('EthWallet', () => {
  let factory: IWalletFactory, wallet: IWallet, address: Address
  beforeEach(async () => {
    factory = new EthWalletFactory()
    wallet = await factory.fromPrivateKey(
      '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
    )
    address = wallet.getAddress()
  })
  it('succeed to sign hex string', async () => {
    const message = '0x00123456'
    const signatureDigest = await wallet.signMessage(message)
    const signature = ethers.utils.splitSignature(signatureDigest)
    const recoverAddress = ethers.utils.recoverAddress(message, signature)
    expect(recoverAddress).toBe(address)
  })
  it('fail to sign string', () => {
    const message = 'message'
    expect(() => {
      wallet.signMessage(message)
    }).toThrow()
  })
})
