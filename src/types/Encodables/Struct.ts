import { ICoder } from '../../coder/ICoder'
import IEncodable from './IEncodable'

// TODO: implement struct
export default class Struct implements IEncodable {
  readonly type: object
  readonly v: object

  constructor(type: object, v: object) {
    // TODO: check the validity of type and object
    this.type = type
    this.v = v
  }

  public get raw() {
    return {}
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }
}
