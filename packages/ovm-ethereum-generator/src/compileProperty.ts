import {
  generateSolidityCode,
  SolidityCodeGeneratorOptions
} from '@cryptoeconomicslab/ovm-solidity-generator'
import { generateEVMByteCode } from './'
import { transpile } from '@cryptoeconomicslab/ovm-transpiler'
import { Import, Parser } from '@cryptoeconomicslab/ovm-parser'
import fs from 'fs'
import path from 'path'
import { AbiCoder } from 'ethers/utils'
const abi = new AbiCoder()

/**
 * @name compileAllSourceFiles
 * @description compile all files in a directory
 * @param sourceDir source directory of property definition
 * @param outputDir output directory of generated JSON
 */
export async function compileAllSourceFiles(
  sourceDir: string,
  outputDir: string
) {
  const files = fs.readdirSync(sourceDir)

  await Promise.all(
    files.map(async f => {
      const ext = path.extname(f)
      if (ext == '.ovm') {
        const contractName = path.basename(f, ext)
        const resultSolidity = await compile(
          sourceDir,
          contractName,
          generateSolidityCode
        )
        const resultBytecode = await compile(
          sourceDir,
          contractName,
          generateEVMByteCode
        )
        console.log(
          `${contractName} = 
          ${JSON.parse(resultBytecode).evm.bytecode.object.length / 2} byte`
        )
        fs.writeFileSync(
          path.join(outputDir, `${contractName}.sol`),
          resultSolidity
        )
        fs.writeFileSync(
          path.join(outputDir, `${contractName}.json`),
          resultBytecode
        )
      }
    })
  )
}

const load = (loadPath: string, contractName: string) =>
  fs.readFileSync(path.join(loadPath, contractName + '.ovm')).toString()

export async function compile(
  basePath: string,
  contractName: string,
  generate: (
    source: string,
    importHandler: (_import: Import) => string,
    options?: SolidityCodeGeneratorOptions
  ) => Promise<string>
): Promise<string> {
  const source = load(basePath, contractName)
  return await generate(
    source,
    (_import: Import) => {
      return load(path.join(basePath, _import.path), _import.module)
    },
    {
      ovmPath: '.',
      addressTable: {},
      solcSettings: {
        optimizer: {
          enabled: true
        }
      }
    }
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
