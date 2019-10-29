import { ICoder } from '../../coder/Coder'

/**
 * Codable abstract class
 * All types that can be encoded to certain encoding format must implement
 * this interface.
 */
export default abstract class Codable {
  decode(): Codable {
    throw new Error('Not implemented')
  }

  public abstract encode(coder: ICoder): string
  public raw: any
  public toTypeString(): string {
    return this.constructor.name
  }
  public toString(): string {
    return String(this)
  }
}
