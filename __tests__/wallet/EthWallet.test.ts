import { EthWalletFactory } from '../../src/wallet/eth/EthWalletFactory'

describe('EthWallet', () => {
  it('signMessage works', async () => {
    const factory = new EthWalletFactory()
    const wallet = await factory.fromPrivateKey(
      '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
    )
    const signature = wallet.signMessage('message')
    expect(signature).toBeTruthy()
  })
})
