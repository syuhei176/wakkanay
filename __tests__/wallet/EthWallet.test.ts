import { EthWalletFactory, IWallet, IWalletFactory } from '../../src/wallet'
import { ethers } from 'ethers'
import { Address, Bytes } from '../../src/types/Codables'

describe('EthWallet', () => {
  let factory: IWalletFactory, wallet: IWallet, address: Address
  beforeEach(async () => {
    factory = new EthWalletFactory()
    wallet = await factory.fromPrivateKey(
      '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
    )
    address = wallet.getAddress()
  })
  describe('signMessage', () => {
    it('succeed to sign hex string', async () => {
      const message = Bytes.fromHexString('0x00123456')
      const signatureDigest = await wallet.signMessage(message)
      const signature = ethers.utils.splitSignature(
        signatureDigest.toHexString()
      )
      const recoverAddress = ethers.utils.recoverAddress(
        message.toHexString(),
        signature
      )
      expect(recoverAddress).toBe(ethers.utils.getAddress(address.data))
    })
  })
  describe('recoverAddress', () => {
    it('succeed to recover address', async () => {
      const message = Bytes.fromHexString('0x00123456')
      const signatureDigest = await wallet.signMessage(message)
      const recoverAddress = wallet.recoverAddress(message, signatureDigest)
      expect(recoverAddress.data).toBe(address.data)
    })
  })
})
