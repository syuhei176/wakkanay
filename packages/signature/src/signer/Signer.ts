import { Bytes } from '@cryptoeconomicslab/primitives'
export default interface Signer {
  sign(message: Bytes): Promise<Bytes>
}
