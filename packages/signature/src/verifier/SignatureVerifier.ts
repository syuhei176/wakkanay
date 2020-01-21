import { Bytes } from '@cryptoeconomicslab/primitives'
export default interface SignatureVerifier {
  verify(message: Bytes, signature: Bytes, publicKey: Bytes): Promise<boolean>
}
