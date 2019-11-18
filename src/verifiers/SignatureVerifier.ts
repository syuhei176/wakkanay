import { Bytes } from '../types/Codables'
export default interface SignatureVerifier {
  verify(message: Bytes, signature: Bytes, publicKey: Bytes): Promise<boolean>
}
