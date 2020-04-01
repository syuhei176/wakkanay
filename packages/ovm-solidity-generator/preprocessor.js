const fs = require('fs')
const path = require('path')

const list = [
  './src/sol.ejs',
  './src/decide.ejs',
  './src/getChild.ejs',
  './src/constructProperty.ejs',
  './src/constructInputs.ejs',
  './src/constructInput.ejs',
  './src/decideProperty.ejs'
]

list.forEach(file => {
  convert(path.join(__dirname, file))
})

function convert(filePath) {
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath)
  const newFilePath = path.join(
    path.dirname(filePath),
    path.basename(filePath, ext) + '.ts'
  )
  fs.writeFileSync(
    newFilePath,
    `const text =
  ${JSON.stringify(data.toString())}\nexport default text
`
  )
}
