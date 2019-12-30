export * from './Coder'
export * from './Error'
import JsonCoder from './JsonCoder'
import { Coder } from './Coder'

let defaultCoder = JsonCoder

export default JsonCoder

export const getDefaultCoder = (): Coder => {
  return defaultCoder
}

export const setDefaultCoder = (coder: Coder) => {
  defaultCoder = coder
}
