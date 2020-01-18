import Wallet from './Wallet'

export default interface WalletFactory {
  fromPrivateKey(privateKey: string): Promise<Wallet>
}
