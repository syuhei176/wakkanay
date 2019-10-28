import { ICoder } from '../../coder/ICoder'

// TODO: change this to Codable
// add decode to interface
/**
 * Codable interface
 * All types that can be encoded to certain encoding format must implement
 * this interface.
 */
export default interface Codable {
  encode(coder: ICoder): string
  raw: any
  toTypeString(): string
  toString(): string
}
