import { ICoder } from '../coder/ICoder'

export default interface IEncodable {
  encode(coder: ICoder): string
}

export class Integer implements IEncodable {
  encode(coder: ICoder): string {
    return coder.encodeInteger(this)
  }
}

export class Bytes implements IEncodable {
  encode(coder: ICoder): string {
    return coder.encodeBytes(this)
  }
}

export class List implements IEncodable {
  encode(coder: ICoder): string {
    return coder.encodeList(this)
  }
}

export class Tuple implements IEncodable {
  encode(coder: ICoder): string {
    return coder.encodeTuple(this)
  }
}
