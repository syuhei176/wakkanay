import { CompiledPredicate } from '@cryptoeconomicslab/ovm-transpiler'

export interface CodeGenerator {
  generate(claimDefs: CompiledPredicate[]): Promise<string>
}
