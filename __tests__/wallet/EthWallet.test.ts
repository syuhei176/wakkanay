import { EthWalletFactory, IWallet, IWalletFactory } from '../../src/wallet'
import { Address, Bytes } from '../../src/types/Codables'

describe('EthWallet', () => {
  let factory: IWalletFactory, wallet: IWallet
  beforeEach(async () => {
    factory = new EthWalletFactory()
    wallet = await factory.fromPrivateKey(
      '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
    )
  })
  describe('signMessage', () => {
    it('succeed to sign hex string', async () => {
      const message = Bytes.fromHexString('0x00123456')
      const signature = await wallet.signMessage(message)
      expect(signature).toBeTruthy()
    })
  })
  describe('verifySignature', () => {
    it('succeed to verify signature', async () => {
      const message = Bytes.fromHexString('0x00123456')
      const signatureDigest = await wallet.signMessage(message)
      const verify = await wallet.verifySignature(message, signatureDigest, Bytes.default())
      expect(verify).toBeTruthy()
    })
    it('fail to verify signature', async () => {
      const bobWallet = await factory.fromPrivateKey(
        '0x17d08f5fe8c77af811caa0c9a187e668ce3b74a99acc3f6d976f075fa8e0be55'
      )
      const message = Bytes.fromHexString('0x00123456')
      const bobSignatureDigest = await bobWallet.signMessage(message)
      const verify = await wallet.verifySignature(message, bobSignatureDigest, Bytes.default())
      expect(verify).toBeFalsy()
    })
  })
  describe('getL1Balance', () => {
    it('succeed to get L1 balance', async () => {
      const balance = await wallet.getL1Balance()
      expect(balance).toBeTruthy()
    })
    it('succeed to get L1(ERC20) balance', async () => {
      // it is the WETH address on Kovan Testnet
      const tokenAddress = Address.from('0xd0a1e359811322d97991e03f863a0c30c2cf029c')
      const balance = await wallet.getL1Balance(tokenAddress)
      expect(balance).toBeTruthy()
    })
  })
})
