import { Bytes } from '../types/Codables'
export default interface Signer {
  sign(message: Bytes): Promise<Bytes>
}
