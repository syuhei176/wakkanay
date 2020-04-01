import { BigNumber } from '@cryptoeconomicslab/primitives'
import { createCompiledPredicates } from './ContractCompiler'
import { applyLibraries } from './QuantifierTranslater'
import { CompiledPredicate } from './CompiledPredicate'
import {
  Import,
  Program,
  PropertyDef
} from '@cryptoeconomicslab/ovm-parser/lib/PropertyDef'
import { isLibrary } from './utils'

export type ImportHandler = (_import: Import) => Program
const DefaultImportHandler: ImportHandler = () => {
  throw new Error('import handler is not set')
}

/**
 * transpile a Program to CompiledPredicate
 * @param program Original program
 * @param importHandler A handler to load module
 */
export function transpile(
  program: Program,
  importHandler: ImportHandler = DefaultImportHandler,
  defaultConstantValues?: { [key: string]: string }
): CompiledPredicate[] {
  const constantValues = defaultConstantValues || {
    zero: ovmContext.coder.encode(BigNumber.from(0)).toHexString()
  }
  const importPredicates = createImportPredicates(importHandler, constantValues)

  // Compile predicates which aren't library
  return createCompiledPredicates(
    applyLibraries(
      program.declarations,
      importPredicates(program),
      constantValues
    ).filter(p => !isLibrary(p))
  )
}

/**
 * create an import predicates function
 * @param importHandler
 */
function createImportPredicates(
  importHandler: ImportHandler,
  constants: { [key: string]: string }
) {
  const importPredicates = (program: Program): PropertyDef[] =>
    program.imports.reduce<PropertyDef[]>((declarations, i) => {
      const p = importHandler(i)
      return declarations.concat(
        applyLibraries(p.declarations, importPredicates(p), constants)
      )
    }, [])
  return importPredicates
}
