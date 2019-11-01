/**
 * Codable abstract class
 * primitive types implement this interface.
 * custom codable class had better implement transformation function into Struct Type
 */
export default interface Codable {
  raw: any
  setData(data: any): void
  toTypeString(): string
  toString(): string
}
