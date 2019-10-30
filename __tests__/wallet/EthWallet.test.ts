import { EthWalletFactory } from '../../src/wallet'
import { ethers } from 'ethers'

describe('EthWallet', () => {
  it('signMessage works', async () => {
    const factory = new EthWalletFactory()
    const wallet = await factory.fromPrivateKey(
      '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
    )
    const address = await wallet.getAddress()
    const message = '0x00123456'
    const signatureDigest = await wallet.signMessage(message)
    const signature = ethers.utils.splitSignature(signatureDigest)
    const recoverAddress = ethers.utils.recoverAddress(message, signature)
    expect(recoverAddress).toBe(address)
  })
})
