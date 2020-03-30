import peg from 'pegjs'
import chamberPeg from './chamber'
import { Program } from './PropertyDef'

export class Parser {
  parse(src: string): Program {
    const parser = peg.generate(chamberPeg)
    return parser.parse(src)
  }
}
