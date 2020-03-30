import peg from 'pegjs'
import chamberPeg from './chamber'
import { Program } from './PropertyDef'

export class Parser {
  /**
   * @name parse
   * @description parses DSL and returns Program
   * @param src source code of predicate written with DSL
   */
  parse(src: string): Program {
    const parser = peg.generate(chamberPeg)
    return parser.parse(src)
  }
}
