import { ICoder } from '../../coder/ICoder'

/**
 * Encodable interface
 * All types that can be encoded to certain encoding format must implement
 * this interface.
 */
export default interface IEncodable {
  encode(coder: ICoder): string
  raw: any
}
