import { generateSolidityCode } from '@cryptoeconomicslab/ovm-solidity-generator'
import { generateEVMByteCode, SolcSettings } from './'
import { transpile } from '@cryptoeconomicslab/ovm-transpiler'
import { Import, Parser } from '@cryptoeconomicslab/ovm-parser'
import fs from 'fs'
import path from 'path'
import { AbiCoder } from 'ethers/utils'
const abi = new AbiCoder()

const load = (loadPath: string, contractName: string) =>
  fs.readFileSync(path.join(loadPath, contractName + '.ovm')).toString()

/**
 * @name compileAllSourceFiles
 * @description compile all files in a directory
 * @param sourceDir source directory of property definition
 * @param outputDir output directory of generated JSON
 */
export async function compileAllSourceFiles(
  sourceDir: string,
  outputDir: string,
  solcSettings: SolcSettings
) {
  const files = fs.readdirSync(sourceDir)

  await Promise.all(
    files.map(async f => {
      const ext = path.extname(f)
      if (ext == '.ovm') {
        const contractName = path.basename(f, ext)
        const source = load(sourceDir, contractName)
        const options = {
          ovmPath: '.',
          addressTable: {}
        }
        const importHandler = (_import: Import) =>
          load(path.join(sourceDir, _import.path), _import.module)
        const solidityCode = await generateSolidityCode(
          source,
          importHandler,
          options
        )
        const byteCode = await generateEVMByteCode(source, importHandler, {
          solcSettings,
          ...options
        })
        console.log(
          `${contractName} = 
          ${JSON.parse(byteCode).evm.bytecode.object.length / 2} byte`
        )
        fs.writeFileSync(
          path.join(outputDir, `${contractName}.sol`),
          solidityCode
        )
        fs.writeFileSync(path.join(outputDir, `${contractName}.json`), byteCode)
      }
    })
  )
}

export function compileJSON(basePath: string, contractName: string) {
  const source = load(basePath, contractName)
  const parser = new Parser()
  return transpile(
    parser.parse(source),
    (_import: Import) => {
      const source = load(path.join(basePath, _import.path), _import.module)
      return parser.parse(source)
    },
    { zero: abi.encode(['uint256'], [0]) }
  )
}
