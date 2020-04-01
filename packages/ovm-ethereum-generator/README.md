# ovm-ethereum-generator

## Usage

```
npm i @cryptoeconomicslab/ovm-ethereum-generator
```

```js
import { Parser } from '@cryptoeconomicslab/ovm-parser'
import { transpile } from '@cryptoeconomicslab/ovm-transpiler'
import { generateEVMByteCode } from '@cryptoeconomicslab/ovm-ethereum-generator'

const parser = new Parser()
const generator = new SolidityCodeGenerator()
const compiledPredicates = transpile(
  parser.parse(
    'def ownership(owner) := with Tx(su) as tx { SignedBy(tx, owner) }' +
      'def SignedBy(message, owner) := with Bytes() as signature {IsValidSignature(message, owner, signature)}'
  )
)
const result = generateEVMByteCode(compiledPredicates)
console.log(result)
```

## Online Demo

https://ovm-compiler.netlify.app
