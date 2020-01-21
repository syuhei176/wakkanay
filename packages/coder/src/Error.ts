import { Codable } from '@cryptoeconomicslab/primitives'

export class JsonDecodeError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'JsonError'
  }

  static from(codable: Codable): JsonDecodeError {
    return new JsonDecodeError(`Cannot decode object: ${codable.toString()}`)
  }
}
