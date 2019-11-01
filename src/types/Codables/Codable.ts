/**
 * Codable abstract class
 * All types that can be encoded to certain encoding format must implement
 * this interface.
 */
export default interface Codable {
  raw: any
  setData(data: any): void
  toTypeString(): string
  toString(): string
}
