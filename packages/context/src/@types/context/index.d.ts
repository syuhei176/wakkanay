declare interface Context {
  coder: import('@cryptoeconomicslab/coder').Coder
}

declare namespace NodeJS {
  interface Global {
    context: Context
  }
}

declare global {
  interface Window {
    context: Context
  }
}
