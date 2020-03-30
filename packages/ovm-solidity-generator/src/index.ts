import {
  SolidityCodeGeneratorOptions,
  SolidityCodeGenerator
} from './SolidityCodeGenerator'
import { Parser, Import } from '@cryptoeconomicslab/ovm-parser'
import { transpile } from '@cryptoeconomicslab/ovm-transpiler'

export async function generateSolidityCode(
  source: string,
  importHandler: (_import: Import) => string,
  options?: SolidityCodeGeneratorOptions
): Promise<string> {
  const chamberParser = new Parser()
  const compiledPredicates = transpile(
    chamberParser.parse(source),
    (_import: Import) => {
      return chamberParser.parse(importHandler(_import))
    },
    { zero: '0' }
  )
  const codeGenerator = new SolidityCodeGenerator(options)
  return codeGenerator.generate(compiledPredicates)
}

export { SolidityCodeGeneratorOptions, SolidityCodeGenerator }
