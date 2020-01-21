import { Address, Bytes } from '@cryptoeconomicslab/primitives'
import Balance from './Balance'

export default interface Wallet {
  getAddress(): Address
  getL1Balance(tokenAddress?: Address): Promise<Balance>

  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  signMessage(message: Bytes): Promise<Bytes>

  /**
   * Verify message and signature from publicKey
   * publicKey isn't needed depending on the cryptographic algorithm
   * @param message
   * @param signature
   * @param publicKey?
   */
  verifyMySignature(message: Bytes, signature: Bytes): Promise<boolean>
}
