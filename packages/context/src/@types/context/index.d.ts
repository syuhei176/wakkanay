declare interface Context {
  coder: import('@cryptoeconomicslab/coder').Coder
}

declare namespace NodeJS {
  interface Global {
    ovmContext: Context
  }
}

declare global {
  interface Window {
    ovmContext: Context
  }
}
